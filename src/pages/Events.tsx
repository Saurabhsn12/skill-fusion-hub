import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import EventCard from "@/components/EventCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const Events = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCampus, setSelectedCampus] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, selectedCategory, selectedCampus, events]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      
      const formattedEvents = data.map(event => ({
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
        campus: event.campus,
      }));

      setEvents(formattedEvents);
      setFilteredEvents(formattedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = [...events];

    if (searchQuery) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => 
        event.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedCampus !== "all") {
      filtered = filtered.filter(event => 
        event.campus.toLowerCase().includes(selectedCampus.toLowerCase())
      );
    }

    setFilteredEvents(filtered);
  };

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

            <Select value={selectedCampus} onValueChange={setSelectedCampus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campuses</SelectItem>
                <SelectItem value="iit">IIT</SelectItem>
                <SelectItem value="delhi">Delhi University</SelectItem>
                <SelectItem value="mumbai">Mumbai University</SelectItem>
                <SelectItem value="bangalore">Bangalore University</SelectItem>
                <SelectItem value="public">Public Event</SelectItem>
                <SelectItem value="online">Online Event</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Events Grid or Empty State */}
        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading events...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
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
            {filteredEvents.map((event) => (
              <EventCard key={event.id} {...event} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
