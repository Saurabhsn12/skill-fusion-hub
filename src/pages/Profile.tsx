import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Instagram, Linkedin, MessageSquare, Calendar, Trophy, Upload, Loader2, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { z } from "zod";

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required").max(100, "Name too long"),
  bio: z.string().max(500, "Bio too long").optional(),
  bgmi_id: z.string().max(50, "ID too long").optional(),
  coc_id: z.string().max(50, "ID too long").optional(),
  instagram_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  discord_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({ participated: 0, registered: 0, ranking: null as number | null, totalUsers: 0 });
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    bgmi_id: "",
    coc_id: "",
    instagram_url: "",
    discord_url: "",
    linkedin_url: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
    fetchUserEvents();
    fetchUserStats();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        bio: data.bio || "",
        bgmi_id: data.bgmi_id || "",
        coc_id: data.coc_id || "",
        instagram_url: data.instagram_url || "",
        discord_url: data.discord_url || "",
        linkedin_url: data.linkedin_url || "",
      });
    } catch (error: any) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserEvents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('registrations')
        .select(`
          *,
          events (*)
        `)
        .eq('user_id', user.id);

      setEvents(data || []);
    } catch (error) {
      toast.error("Failed to load events");
    }
  };

  const fetchUserStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rankings } = await supabase
        .from('user_rankings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (rankings) {
        setStats({
          participated: rankings.events_participated || 0,
          registered: rankings.events_registered || 0,
          ranking: rankings.ranking || null,
          totalUsers: totalUsers || 0,
        });
      }
    } catch (error) {
      toast.error("Failed to load statistics");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      
      if (file.size > maxSize) {
        toast.error("Image too large. Maximum size is 5MB.");
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid file type. Please upload JPEG, PNG, WebP, or GIF.");
        return;
      }
      
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const validation = profileSchema.safeParse(editForm);
      if (!validation.success) {
        toast.error(validation.error.errors[0].message);
        return;
      }

      setUploading(true);
      setUploadProgress(10);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        setUploadProgress(30);
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        
        setUploadProgress(60);
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      setUploadProgress(80);
      const { error } = await supabase
        .from('profiles')
        .update({
          ...validation.data,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setUploadProgress(100);
      toast.success("Profile updated successfully!");
      setEditDialogOpen(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      fetchProfile();
      fetchUserStats();
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Loading profile...</p>
    </div>;
  }

  if (!profile) {
    return <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    </div>;
  }

  const currentEvents = events.filter(e => new Date(e.events.event_date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.events.event_date) < new Date());

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Events Participated</p>
                  <p className="text-3xl font-bold text-foreground">{stats.participated}</p>
                </div>
                <Trophy className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Events Registered</p>
                  <p className="text-3xl font-bold text-foreground">{stats.registered}</p>
                </div>
                <Calendar className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Global Ranking</p>
                  <p className="text-3xl font-bold text-foreground">
                    {stats.ranking ? `#${stats.ranking}` : "Unranked"}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalUsers}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Header */}
        <Card className="border-border bg-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32 ring-2 ring-primary ring-offset-2 ring-offset-background">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-primary to-accent text-primary-foreground">
                  {profile.full_name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.full_name}</h1>
                {profile.bio && <p className="text-muted-foreground mb-4">{profile.bio}</p>}
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  {profile.bgmi_id && (
                    <Badge variant="secondary">BGMI: {profile.bgmi_id}</Badge>
                  )}
                  {profile.coc_id && (
                    <Badge variant="secondary">COC: {profile.coc_id}</Badge>
                  )}
                </div>

                <div className="flex gap-3 justify-center md:justify-start">
                  {profile.instagram_url && (
                    <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {profile.discord_url && (
                    <a href={profile.discord_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <MessageSquare className="h-5 w-5" />
                    </a>
                  )}
                  {profile.linkedin_url && (
                    <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>

              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Profile Picture (Max 5MB - JPEG, PNG, WebP, GIF)</Label>
                      <div className="flex items-center gap-4 mt-2">
                        {avatarPreview && (
                          <Avatar className="h-20 w-20">
                            <AvatarImage src={avatarPreview} />
                          </Avatar>
                        )}
                        <div className="flex-1">
                          <Input 
                            type="file" 
                            accept="image/jpeg,image/png,image/webp,image/gif" 
                            onChange={handleAvatarChange}
                            disabled={uploading}
                          />
                        </div>
                      </div>
                      {uploading && (
                        <div className="mt-2">
                          <Progress value={uploadProgress} className="h-2" />
                          <p className="text-sm text-muted-foreground mt-1">Uploading... {uploadProgress}%</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label>Full Name</Label>
                      <Input value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} />
                    </div>
                    <div>
                      <Label>Bio</Label>
                      <Textarea value={editForm.bio} onChange={(e) => setEditForm({...editForm, bio: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <Label>BGMI ID</Label>
                      <Input value={editForm.bgmi_id} onChange={(e) => setEditForm({...editForm, bgmi_id: e.target.value})} />
                    </div>
                    <div>
                      <Label>Clash of Clans ID</Label>
                      <Input value={editForm.coc_id} onChange={(e) => setEditForm({...editForm, coc_id: e.target.value})} />
                    </div>
                    <div>
                      <Label>Instagram URL</Label>
                      <Input value={editForm.instagram_url} onChange={(e) => setEditForm({...editForm, instagram_url: e.target.value})} placeholder="https://instagram.com/username" />
                    </div>
                    <div>
                      <Label>Discord URL</Label>
                      <Input value={editForm.discord_url} onChange={(e) => setEditForm({...editForm, discord_url: e.target.value})} placeholder="https://discord.gg/..." />
                    </div>
                    <div>
                      <Label>LinkedIn URL</Label>
                      <Input value={editForm.linkedin_url} onChange={(e) => setEditForm({...editForm, linkedin_url: e.target.value})} placeholder="https://linkedin.com/in/username" />
                    </div>
                    <Button onClick={handleSaveProfile} className="w-full" disabled={uploading}>
                      {uploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Current Events */}
        {currentEvents.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Current Events</h2>
            <div className="grid gap-4">
              {currentEvents.map((reg) => (
                <Card key={reg.id} className="border-border bg-card">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{reg.events.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(reg.events.event_date).toLocaleDateString()} • {reg.events.event_time}
                      </p>
                    </div>
                    <Badge>{reg.events.event_type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-border bg-card mb-8">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Current Events</h3>
              <p className="text-muted-foreground mb-4">You haven't registered for any upcoming events yet.</p>
              <Button variant="outline" onClick={() => navigate('/events')}>Browse Events</Button>
            </CardContent>
          </Card>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Past Events</h2>
            <div className="grid gap-4">
              {pastEvents.map((reg) => (
                <Card key={reg.id} className="border-border bg-card opacity-60">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground">{reg.events.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        <Calendar className="inline h-4 w-4 mr-1" />
                        {new Date(reg.events.event_date).toLocaleDateString()} • {reg.events.event_time}
                      </p>
                    </div>
                    <Badge variant="secondary">{reg.events.event_type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : currentEvents.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Tournament History</h3>
              <p className="text-muted-foreground mb-4">You haven't participated in any events yet. Join your first tournament!</p>
              <Button variant="outline" onClick={() => navigate('/events')}>Explore Events</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Profile;
