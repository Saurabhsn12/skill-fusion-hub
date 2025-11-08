import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { createHmac } from "https://deno.land/std@0.160.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, userId, amount } = await req.json();

    console.log('Verifying payment:', { razorpay_order_id, razorpay_payment_id });

    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'demo_key_secret';

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = createHmac('sha256', keySecret)
      .update(text)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    console.log('Payment signature verified successfully');

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create transaction record
    const { data: transaction, error: txError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: userId,
        event_id: eventId,
        amount,
        currency: 'INR',
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_status: 'completed',
      })
      .select()
      .single();

    if (txError) throw txError;

    // Create registration record
    const { data: registration, error: regError } = await supabaseClient
      .from('registrations')
      .insert({
        user_id: userId,
        event_id: eventId,
        payment_id: transaction.id,
        payment_status: 'completed',
      })
      .select()
      .single();

    if (regError) throw regError;

    console.log('Registration completed:', registration.id);

    return new Response(
      JSON.stringify({ success: true, registration }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
