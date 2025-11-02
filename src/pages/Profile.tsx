import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Award, Target, TrendingUp, Calendar, MapPin } from "lucide-react";

const Profile = () => {
  // Mock data - will be replaced with real data from backend
  const user = {
    name: "John Doe",
    username: "@johndoe",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&q=80",
    bgmiId: "BGMI_Player123",
    level: 15,
    totalEvents: 12,
    wins: 5,
    topRanks: 8,
    skills: ["BGMI", "Free Fire", "COD Mobile"],
    achievements: [
      { id: 1, title: "First Victory", description: "Won your first tournament", icon: Trophy },
      { id: 2, title: "Team Player", description: "Participated in 10+ team events", icon: Award },
      { id: 3, title: "Sharp Shooter", description: "Top 3 finishes in 5 events", icon: Target },
    ],
    recentEvents: [
      {
        id: 1,
        name: "BGMI Campus Championship",
        date: "Nov 28, 2024",
        rank: 1,
        category: "BGMI"
      },
      {
        id: 2,
        name: "Free Fire Max Tournament",
        date: "Nov 15, 2024",
        rank: 3,
        category: "Free Fire"
      },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="border-border bg-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 border-4 border-primary">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold text-foreground">{user.name}</h1>
                  <Badge variant="secondary">Level {user.level}</Badge>
                </div>
                <p className="text-muted-foreground mb-2">{user.username}</p>
                <p className="text-sm text-muted-foreground mb-4">BGMI ID: {user.bgmiId}</p>
                
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {user.skills.map((skill) => (
                    <Badge key={skill} className="bg-primary/20 text-primary border-primary/30">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <Button variant="outline">Edit Profile</Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{user.totalEvents}</p>
                  <p className="text-sm text-muted-foreground">Total Events</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <Award className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{user.wins}</p>
                  <p className="text-sm text-muted-foreground">Wins</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">{user.topRanks}</p>
                  <p className="text-sm text-muted-foreground">Top 3 Finishes</p>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-card">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                  <p className="text-2xl font-bold text-foreground">Level {user.level}</p>
                  <p className="text-sm text-muted-foreground">Current Rank</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.recentEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                          event.rank === 1 ? 'bg-accent' : 'bg-primary'
                        }`}>
                          <span className="text-lg font-bold text-foreground">#{event.rank}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{event.name}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {event.date}
                            </div>
                            <Badge variant="secondary" className="text-xs">{event.category}</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements Sidebar */}
          <div className="space-y-6">
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {user.achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20">
                        <achievement.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
