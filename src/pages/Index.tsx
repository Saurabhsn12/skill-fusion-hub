import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Users, Gamepad2, Target, ArrowRight, Calendar, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import heroImage from "@/assets/hero-gaming.jpg";

const Index = () => {
  // Mock featured events
  const featuredEvents = [
    {
      id: "1",
      title: "BGMI Campus Championship 2024",
      image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80",
      date: "Dec 15, 2024 • 6:00 PM",
      location: "IIT Delhi Campus",
      category: "BGMI",
      participants: 45,
      maxParticipants: 100,
      isPaid: true,
      price: 299,
      featured: true,
    },
    {
      id: "4",
      title: "Valorant Campus Showdown",
      image: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?w=800&q=80",
      date: "Dec 22, 2024 • 8:00 PM",
      location: "Mumbai University",
      category: "Valorant",
      participants: 40,
      maxParticipants: 80,
      isPaid: true,
      price: 499,
      featured: true,
    },
    {
      id: "2",
      title: "Free Fire Max Tournament",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80",
      date: "Dec 18, 2024 • 5:00 PM",
      location: "Delhi University",
      category: "Free Fire",
      participants: 32,
      maxParticipants: 64,
      isPaid: false,
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
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
            <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Compete & Win</h3>
                <p className="text-muted-foreground">Join tournaments with amazing prize pools and prove your skills</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Build Teams</h3>
                <p className="text-muted-foreground">Create or join teams and dominate together</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Skill Portfolio</h3>
                <p className="text-muted-foreground">Showcase your gaming achievements and rankings</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gamepad2 className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">Multi-Game</h3>
                <p className="text-muted-foreground">BGMI, Free Fire, Valorant, and more games supported</p>
              </CardContent>
            </Card>
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
