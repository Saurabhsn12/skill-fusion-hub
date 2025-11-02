import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";

// Mock data - will be replaced with real data from backend
const mockLeaderboard: any[] = [
  // Empty for now to show empty state
];

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top players and their rankings</p>
        </div>

        {/* Empty State or Leaderboard Content */}
        {mockLeaderboard.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Trophy className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                No Leaderboard Data Found
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                The leaderboard will be updated once players start participating in events and tournaments.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mockLeaderboard.map((player, index) => (
              <Card key={player.id} className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center">
                          <Medal className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                          <Award className="h-6 w-6 text-white" />
                        </div>
                      )}
                      {index > 2 && (
                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-foreground">#{index + 1}</span>
                        </div>
                      )}
                    </div>

                    {/* Player Info */}
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={player.avatar} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{player.name}</h3>
                      <p className="text-sm text-muted-foreground">{player.campus}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{player.points}</div>
                      <p className="text-sm text-muted-foreground">points</p>
                    </div>

                    <Badge variant="secondary">{player.rank}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Leaderboard;
