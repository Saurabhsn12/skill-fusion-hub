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
import { Edit, Instagram, Linkedin, MessageSquare, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  useEffect(() => {
    fetchProfile();
    fetchUserEvents();
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
      console.error('Error fetching profile:', error);
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
      console.error('Error fetching events:', error);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let avatarUrl = profile?.avatar_url;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);
        
        avatarUrl = publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          ...editForm,
          avatar_url: avatarUrl,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success("Profile updated successfully!");
      setEditDialogOpen(false);
      fetchProfile();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || "Failed to update profile");
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
        {/* Profile Header */}
        <Card className="border-border bg-card mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-32 w-32">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl">{profile.full_name?.charAt(0)}</AvatarFallback>
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
                      <Label>Profile Picture</Label>
                      <Input type="file" accept="image/*" onChange={handleAvatarChange} />
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
                    <Button onClick={handleSaveProfile} className="w-full">Save Changes</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Current Events */}
        {currentEvents.length > 0 && (
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
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
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
        )}
      </main>
    </div>
  );
};

export default Profile;
