import { useState } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - will be replaced with real data from backend
const mockEvents = [
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
  {
    id: "3",
    title: "Call of Duty Mobile League",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800&q=80",
    date: "Dec 20, 2024 • 7:00 PM",
    location: "Online",
    category: "COD Mobile",
    participants: 28,
    maxParticipants: 50,
    isPaid: true,
    price: 199,
    featured: false,
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
    id: "5",
    title: "Mobile Legends Championship",
    image: "https://images.unsplash.com/photo-1579546929662-711aa81148cf?w=800&q=80",
    date: "Dec 25, 2024 • 6:00 PM",
    location: "Bangalore Tech Park",
    category: "Mobile Legends",
    participants: 38,
    maxParticipants: 60,
    isPaid: false,
    featured: false,
  },
  {
    id: "6",
    title: "Clash Royale Winter Cup",
    image: "https://images.unsplash.com/photo-1560419015-7c427e8ae5ba?w=800&q=80",
    date: "Dec 28, 2024 • 4:00 PM",
    location: "Online",
    category: "Clash Royale",
    participants: 22,
    maxParticipants: 32,
    isPaid: true,
    price: 149,
    featured: false,
  },
];

const Events = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Discover Events</h1>
          <p className="text-muted-foreground">Find and join gaming tournaments near you</p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="bgmi">BGMI</SelectItem>
                <SelectItem value="freefire">Free Fire</SelectItem>
                <SelectItem value="cod">COD Mobile</SelectItem>
                <SelectItem value="valorant">Valorant</SelectItem>
                <SelectItem value="ml">Mobile Legends</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="delhi">Delhi</SelectItem>
                <SelectItem value="mumbai">Mumbai</SelectItem>
                <SelectItem value="bangalore">Bangalore</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Events Grid or Empty State */}
        {mockEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Filter className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              There is no event organized yet
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Be the first to create an exciting gaming event for your community!
            </p>
            <Button variant="hero" onClick={() => window.location.href = '/create-event'}>
              Create Event
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
