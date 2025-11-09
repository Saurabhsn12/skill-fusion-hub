import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    fetchEvent();
    loadRazorpayScript();
  }, [id]);

  const loadRazorpayScript = () => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
  };

  const fetchEvent = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const handleFreeRegistration = async () => {
    try {
      setRegistering(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to register");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from('registrations')
        .insert({
          user_id: user.id,
          event_id: id,
          payment_status: 'completed',
        });

      if (error) throw error;

      toast.success("Registration successful!");
      fetchEvent();
    } catch (error: any) {
      console.error('Error registering:', error);
      toast.error(error.message || "Registration failed");
    } finally {
      setRegistering(false);
    }
  };

  const handlePaidRegistration = async () => {
    try {
      setRegistering(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please login to register");
        navigate("/auth");
        return;
      }

      // Create Razorpay order - amount validation happens server-side
      const { data: orderData, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: {
          currency: 'INR',
          eventId: id,
        },
      });

      if (orderError) throw orderError;

      const options = {
        key: orderData.keyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: event.title,
        description: `Registration for ${event.title}`,
        order_id: orderData.order.id,
        handler: async function (response: any) {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-razorpay-payment', {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: id,
              amount: event.price,
            },
          });

          if (verifyError) {
            toast.error("Payment verification failed");
            return;
          }

          toast.success("Registration successful!");
          fetchEvent();
        },
        prefill: {
          name: user.email?.split('@')[0] || '',
          email: user.email || '',
        },
        theme: {
          color: '#0EA5E9',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast.error(error.message || "Payment failed");
    } finally {
      setRegistering(false);
    }
  };

  const handleRegister = () => {
    if (event.is_paid) {
      handlePaidRegistration();
    } else {
      handleFreeRegistration();
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading event...</p>
    </div>;
  }

  if (!event) {
    return <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Event not found</p>
      </div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img 
            src={event.ad_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80'} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground">{event.event_type}</Badge>
              {event.is_promoted && (
                <Badge className="bg-accent text-accent-foreground">
                  <Trophy className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">{event.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {event.is_paid ? `₹${event.price}` : "Free"}
                  </div>
                  <p className="text-sm text-muted-foreground">per participant</p>
                </div>

                <Button 
                  variant="hero" 
                  size="lg" 
                  className="w-full"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? "Processing..." : "Register Now"}
                </Button>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
                      <p className="text-muted-foreground">{event.event_time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="text-foreground">{event.location}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="text-foreground">
                      Max {event.max_participants} participants
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Organized by</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{event.organizer_name}</p>
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetail;
