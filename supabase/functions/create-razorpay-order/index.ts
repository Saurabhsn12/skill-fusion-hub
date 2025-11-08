import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { amount, currency = 'INR', eventId, userId } = await req.json();

    console.log('Creating Razorpay order:', { amount, currency, eventId, userId });

    // Note: Razorpay keys should be added via secrets
    const keyId = Deno.env.get('RAZORPAY_KEY_ID') || 'demo_key_id';
    const keySecret = Deno.env.get('RAZORPAY_KEY_SECRET') || 'demo_key_secret';

    const auth = btoa(`${keyId}:${keySecret}`);

    const orderData = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `event_${eventId}_${Date.now()}`,
      notes: {
        event_id: eventId,
        user_id: userId,
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
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
