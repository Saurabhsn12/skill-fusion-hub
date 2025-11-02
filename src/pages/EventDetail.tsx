import { useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Users, Trophy, Clock, Award, Shield } from "lucide-react";

const EventDetail = () => {
  const { id } = useParams();

  // Mock data - will be replaced with real data from backend
  const event = {
    id,
    title: "BGMI Campus Championship 2024",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1200&q=80",
    date: "Dec 15, 2024",
    time: "6:00 PM IST",
    location: "IIT Delhi Campus",
    category: "BGMI",
    participants: 45,
    maxParticipants: 100,
    isPaid: true,
    price: 299,
    featured: true,
    description: "Join us for the most exciting BGMI tournament of the year! Compete with the best players from your campus and win amazing prizes. This is your chance to showcase your skills and climb the leaderboard.",
    prizePool: "₹50,000",
    rules: [
      "Teams of 4 players required",
      "All participants must be current students",
      "Tournament format: Squad TPP",
      "Fair play policy strictly enforced"
    ],
    organizer: {
      name: "Skill Fusion Gaming",
      verified: true
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Image */}
        <div className="relative h-96 rounded-xl overflow-hidden mb-8">
          <img 
            src={event.image} 
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-primary text-primary-foreground">{event.category}</Badge>
              {event.featured && (
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
            {/* About */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed">{event.description}</p>
              </CardContent>
            </Card>

            {/* Rules */}
            <Card className="border-border bg-card">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-foreground mb-4">Rules & Guidelines</h2>
                <ul className="space-y-3">
                  {event.rules.map((rule, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{rule}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <Card className="border-border bg-card sticky top-20">
              <CardContent className="p-6 space-y-6">
                <div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {event.isPaid ? `₹${event.price}` : "Free"}
                  </div>
                  <p className="text-sm text-muted-foreground">per participant</p>
                </div>

                <Button variant="hero" size="lg" className="w-full">
                  Register Now
                </Button>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-3 text-sm">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-foreground">{event.date}</p>
                      <p className="text-muted-foreground">{event.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-5 w-5 text-primary" />
                    <p className="text-foreground">{event.location}</p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Users className="h-5 w-5 text-primary" />
                    <p className="text-foreground">
                      {event.participants}/{event.maxParticipants} registered
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <Award className="h-5 w-5 text-primary" />
                    <p className="text-foreground">Prize Pool: {event.prizePool}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Organized by</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-foreground">{event.organizer.name}</p>
                    {event.organizer.verified && (
                      <Badge variant="secondary" className="text-xs">Verified</Badge>
                    )}
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
