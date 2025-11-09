import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Gamepad2, Target, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import PromotedEventsCarousel from "@/components/PromotedEventsCarousel";
import heroImage from "@/assets/hero-gaming.jpg";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [featuredEvents, setFeaturedEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (data) {
      setFeaturedEvents(data.map(event => ({
        id: event.id,
        title: event.title,
        image: event.ad_image_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80',
        date: `${new Date(event.event_date).toLocaleDateString()} • ${event.event_time}`,
        location: event.location,
        category: event.event_type,
        participants: 0,
        maxParticipants: event.max_participants,
        isPaid: event.is_paid,
        price: event.price,
        featured: event.is_promoted,
      })));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Promoted Events Carousel */}
      <PromotedEventsCarousel />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Gaming Event" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Compete, Connect,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Level Up
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join the ultimate gaming community. Discover tournaments, build your skill portfolio, and compete with the best.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/events">
                <Button variant="hero" size="lg">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="outline" size="lg">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Skill Fusion?</h2>
            <p className="text-xl text-muted-foreground">Your gateway to competitive gaming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Link to="/events" className="block">
              <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Compete & Win</h3>
                  <p className="text-muted-foreground">Join tournaments with amazing prize pools and prove your skills</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/leaderboard" className="block">
              <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Build Teams</h3>
                  <p className="text-muted-foreground">Create or join teams and dominate together</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/profile" className="block">
              <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Skill Portfolio</h3>
                  <p className="text-muted-foreground">Showcase your gaming achievements and rankings</p>
                </CardContent>
              </Card>
            </Link>

            <Link to="/events" className="block">
              <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 cursor-pointer hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gamepad2 className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Game</h3>
                  <p className="text-muted-foreground">BGMI, Free Fire, Valorant, and more games supported</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Featured Events</h2>
              <p className="text-xl text-muted-foreground">Don't miss these upcoming tournaments</p>
            </div>
            <Link to="/events">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of gamers already competing on Skill Fusion. Create your profile and start climbing the leaderboards today.
          </p>
          <Link to="/auth">
            <Button variant="hero" size="lg">
              Join Now - It's Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
