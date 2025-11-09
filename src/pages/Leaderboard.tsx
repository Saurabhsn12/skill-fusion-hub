import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Trophy, Medal, Award, TrendingUp, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredData(leaderboardData);
    } else {
      const filtered = leaderboardData.filter(player =>
        player.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
    }
  }, [searchQuery, leaderboardData]);

  const fetchLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('user_rankings')
        .select('*')
        .order('total_points', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLeaderboardData(data || []);
      setFilteredData(data || []);
    } catch (error) {
      // Silent fail - leaderboard loading errors are not critical
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top players and their rankings</p>
          
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 max-w-md"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">Loading leaderboard...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {searchQuery ? "No players found" : "No Rankings Yet"}
              </h3>
              <p className="text-muted-foreground">
                {searchQuery ? "Try a different search term" : "Be the first to compete and climb the leaderboard!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredData.map((player) => (
              <Card key={player.user_id} className="border-border bg-card hover:shadow-[var(--shadow-card)] transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-muted-foreground w-12 text-center">
                        {player.ranking <= 3 ? (
                          player.ranking === 1 ? <Trophy className="h-8 w-8 text-yellow-500 mx-auto" /> :
                          player.ranking === 2 ? <Medal className="h-8 w-8 text-gray-400 mx-auto" /> :
                          <Award className="h-8 w-8 text-orange-600 mx-auto" />
                        ) : (
                          `#${player.ranking}`
                        )}
                      </div>
                      
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={player.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {player.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-foreground">@{player.username || 'anonymous'}</h3>
                        <div className="flex gap-4 mt-1">
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-primary">{player.events_participated}</span> Played
                          </span>
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-accent">{player.events_registered}</span> Registered
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="secondary" className="text-lg px-4 py-2">
                      {player.total_points.toLocaleString()} pts
                    </Badge>
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
