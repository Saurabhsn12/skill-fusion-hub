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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount } = await req.json();

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

    // Use service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Create transaction record with authenticated user ID
    const { data: transaction, error: txError } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: user.id,
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

    // Create registration record with authenticated user ID
    const { data: registration, error: regError } = await supabaseAdmin
      .from('registrations')
      .insert({
        user_id: user.id,
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
