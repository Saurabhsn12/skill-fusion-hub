import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Teams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [myTeams, setMyTeams] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setCurrentUserId(user.id);
    fetchTeams(user.id);
  };

  const fetchTeams = async (userId: string) => {
    // Fetch all teams
    const { data: allTeams } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(count),
        creator:profiles!teams_created_by_fkey(username, avatar_url)
      `)
      .order('created_at', { ascending: false });

    setTeams(allTeams || []);

    // Fetch user's teams
    const { data: userTeams } = await supabase
      .from('team_members')
      .select(`
        *,
        team:teams(*)
      `)
      .eq('user_id', userId);

    setMyTeams(userTeams?.map(t => t.team) || []);
  };

  const createTeam = async () => {
    if (!currentUserId || !newTeamName.trim()) return;

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: newTeamName.trim(),
        description: newTeamDescription.trim(),
        created_by: currentUserId,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    // Add creator as team leader
    await supabase
      .from('team_members')
      .insert({
        team_id: data.id,
        user_id: currentUserId,
        role: 'leader',
      });

    toast({
      title: "Team created!",
      description: "Your team has been created successfully.",
    });

    setCreateDialogOpen(false);
    setNewTeamName("");
    setNewTeamDescription("");
    fetchTeams(currentUserId);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Teams</h1>
            <p className="text-muted-foreground">Create and manage your gaming teams</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="team-name">Team Name</Label>
                  <Input
                    id="team-name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Enter team name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team-description">Description (Optional)</Label>
                  <Textarea
                    id="team-description"
                    value={newTeamDescription}
                    onChange={(e) => setNewTeamDescription(e.target.value)}
                    placeholder="Describe your team..."
                    rows={3}
                  />
                </div>
                <Button onClick={createTeam} className="w-full">Create Team</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">My Teams</h2>
          {myTeams.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Teams Yet</h3>
                <p className="text-muted-foreground">Create a team to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTeams.map((team) => (
                <Card key={team.id} className="border-border bg-card hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      {team.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {team.description || "No description"}
                    </p>
                    <Button variant="outline" className="w-full">View Team</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-foreground mb-4">All Teams</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    {team.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={team.creator?.avatar_url} />
                      <AvatarFallback>
                        {team.creator?.username?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      by @{team.creator?.username}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {team.description || "No description"}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {team.team_members?.[0]?.count || 0} members
                    </span>
                    <Button variant="outline" size="sm">View</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Teams;
