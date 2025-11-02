import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, Search, User } from "lucide-react";
import brandLogo from "@/assets/brand-logo.png";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <img src={brandLogo} alt="Skill Fusion" className="h-10 w-auto" />
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/events" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Browse Events
              </Link>
              <Link to="/create-event" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Create Event
              </Link>
              <Link to="/leaderboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors">
                Leaderboard
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="hidden md:inline-flex">
              <Search className="h-5 w-5" />
            </Button>
            
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </Link>
            
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
