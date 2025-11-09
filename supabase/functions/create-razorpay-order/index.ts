import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.78.0';

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

    const { currency = 'INR', eventId } = await req.json();

    // Fetch event details from database to validate and get actual price
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('price, is_paid, title')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      throw new Error('Event not found');
    }

    if (!event.is_paid) {
      throw new Error('Event is not a paid event');
    }

    // Check if user already registered
    const { data: existingReg } = await supabaseClient
      .from('registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', user.id)
      .single();

    if (existingReg) {
      return new Response(
        JSON.stringify({ error: 'You are already registered for this event' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Creating Razorpay order:', { amount: event.price, currency, eventId, userId: user.id });

    // Ensure Razorpay credentials are configured
    const keyId = Deno.env.get('RAZORPAY_KEY_ID');
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!keyId || !keySecret) {
      console.error('Razorpay credentials not configured');
      throw new Error('Payment system configuration error');
    }

    const auth = btoa(`${keyId}:${keySecret}`);

    const orderData = {
      amount: event.price * 100, // Convert to paise - use database price
      currency,
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        user_id: user.id,
      },
    };

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    const order = await response.json();

    if (!response.ok) {
      throw new Error(order.error?.description || 'Failed to create order');
    }

    console.log('Razorpay order created:', order.id);

    return new Response(
      JSON.stringify({ order, keyId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    
    // Return generic error to client, log details server-side only
    const userMessage = error instanceof Error && error.message.includes('registered') 
      ? 'You are already registered for this event'
      : error instanceof Error && error.message.includes('configuration')
      ? 'Payment system is temporarily unavailable'
      : 'Failed to process payment. Please try again later';
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
