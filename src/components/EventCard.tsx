import { Calendar, MapPin, Users, Trophy } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EventCardProps {
  id: string;
  title: string;
  image: string;
  date: string;
  location: string;
  category: string;
  participants: number;
  maxParticipants: number;
  isPaid: boolean;
  price?: number;
  featured?: boolean;
}

const EventCard = ({ 
  id, 
  title, 
  image, 
  date, 
  location, 
  category, 
  participants, 
  maxParticipants,
  isPaid,
  price,
  featured = false 
}: EventCardProps) => {
  return (
    <Card className="group overflow-hidden border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300 hover:scale-[1.02]">
      <div className="relative overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        {featured && (
          <Badge className="absolute top-3 left-3 bg-accent text-accent-foreground">
            <Trophy className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        )}
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
          {category}
        </Badge>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <Link to={`/event/${id}`}>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span className="line-clamp-1">{location}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span>{participants}/{maxParticipants} participants</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="text-lg font-bold text-foreground">
          {isPaid ? `₹${price}` : "Free"}
        </div>
        <Link to={`/event/${id}`}>
          <Button variant="default" size="sm">
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EventCard;
