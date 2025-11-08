import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PromotedEvent {
  id: string;
  title: string;
  ad_image_url: string | null;
  event_date: string;
  event_time: string;
  location: string;
  campus: string;
  event_type: string;
  is_paid: boolean;
  price: number | null;
}

const PromotedEventsCarousel = () => {
  const [promotedEvents, setPromotedEvents] = useState<PromotedEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPromotedEvents();
  }, []);

  const fetchPromotedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('is_promoted', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setPromotedEvents(data || []);
    } catch (error) {
      console.error('Error fetching promoted events:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % promotedEvents.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + promotedEvents.length) % promotedEvents.length);
  };

  if (loading || promotedEvents.length === 0) return null;

  const currentEvent = promotedEvents[currentIndex];

  return (
    <section className="py-8 bg-gradient-to-b from-card/50 to-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-foreground mb-6">Featured Events</h2>
        
        <div className="relative">
          <Card className="overflow-hidden border-border bg-card">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {/* Image Section */}
              <div className="relative h-64 md:h-96">
                <img
                  src={currentEvent.ad_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80'}
                  alt={currentEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>

              {/* Content Section */}
              <CardContent className="p-8 flex flex-col justify-center">
                <Badge className="w-fit mb-4 bg-primary text-primary-foreground">
                  {currentEvent.event_type}
                </Badge>
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  {currentEvent.title}
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span>{new Date(currentEvent.event_date).toLocaleDateString()} • {currentEvent.event_time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>{currentEvent.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    <span>{currentEvent.campus}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Link to={`/event/${currentEvent.id}`}>
                    <Button variant="hero" size="lg">
                      {currentEvent.is_paid ? `Register for ₹${currentEvent.price}` : 'Register Now'}
                    </Button>
                  </Link>
                  {currentEvent.is_paid && (
                    <span className="text-2xl font-bold text-foreground">
                      ₹{currentEvent.price}
                    </span>
                  )}
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Navigation Buttons */}
          {promotedEvents.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Dots Indicator */}
          {promotedEvents.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {promotedEvents.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-primary w-8' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PromotedEventsCarousel;
