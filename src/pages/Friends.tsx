import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Search, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [friendRequests, setFriendRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    fetchFriendRequests(user.id);
    fetchFriends(user.id);
  };

  const fetchFriendRequests = async (userId: string) => {
    const { data } = await supabase
      .from('friend_requests')
      .select(`
        *,
        sender:profiles!friend_requests_sender_id_fkey(user_id, username, avatar_url, full_name)
      `)
      .eq('receiver_id', userId)
      .eq('status', 'pending');

    setFriendRequests(data || []);
  };

  const fetchFriends = async (userId: string) => {
    const { data } = await supabase
      .from('friend_requests')
      .select(`
        *,
        sender:profiles!friend_requests_sender_id_fkey(user_id, username, avatar_url, full_name),
        receiver:profiles!friend_requests_receiver_id_fkey(user_id, username, avatar_url, full_name)
      `)
      .eq('status', 'accepted')
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);

    const friendsList = (data || []).map(req => {
      const friend = req.sender_id === userId ? req.receiver : req.sender;
      return { ...friend, requestId: req.id };
    });

    setFriends(friendsList);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    const { data } = await supabase
      .from('profiles')
      .select('user_id, username, avatar_url, full_name')
      .ilike('username', `%${searchQuery}%`)
      .neq('user_id', currentUserId)
      .limit(20);

    setSearchResults(data || []);
  };

  const sendFriendRequest = async (receiverId: string) => {
    if (!currentUserId) return;

    const { error } = await supabase
      .from('friend_requests')
      .insert({
        sender_id: currentUserId,
        receiver_id: receiverId,
        status: 'pending',
      });

    if (error) {
      if (error.code === '23505') {
        toast({
          title: "Request already sent",
          description: "You've already sent a friend request to this user.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send friend request",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Request sent!",
        description: "Friend request has been sent successfully.",
      });
      setSearchResults([]);
      setSearchQuery("");
    }
  };

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    const { error } = await supabase
      .from('friend_requests')
      .update({ status: accept ? 'accepted' : 'rejected' })
      .eq('id', requestId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to process friend request",
        variant: "destructive",
      });
    } else {
      toast({
        title: accept ? "Friend added!" : "Request rejected",
        description: accept ? "You are now friends" : "Friend request rejected",
      });
      if (currentUserId) {
        fetchFriendRequests(currentUserId);
        fetchFriends(currentUserId);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Friends & Social</h1>
          <p className="text-muted-foreground">Connect with other players and build your team</p>
        </div>

        <Tabs defaultValue="friends" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="friends">
              <Users className="h-4 w-4 mr-2" />
              Friends ({friends.length})
            </TabsTrigger>
            <TabsTrigger value="requests">
              <UserPlus className="h-4 w-4 mr-2" />
              Requests ({friendRequests.length})
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Find Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <div className="space-y-4">
              {friends.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="p-12 text-center">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Friends Yet</h3>
                    <p className="text-muted-foreground">Start connecting with other players!</p>
                  </CardContent>
                </Card>
              ) : (
                friends.map((friend) => (
                  <Card key={friend.user_id} className="border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={friend.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {friend.username?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">@{friend.username}</h3>
                          <p className="text-sm text-muted-foreground">{friend.full_name}</p>
                        </div>
                        <Button variant="outline" onClick={() => navigate(`/profile/${friend.user_id}`)}>
                          View Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="space-y-4">
              {friendRequests.length === 0 ? (
                <Card className="border-border bg-card">
                  <CardContent className="p-12 text-center">
                    <UserPlus className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-foreground mb-2">No Pending Requests</h3>
                    <p className="text-muted-foreground">You don't have any friend requests</p>
                  </CardContent>
                </Card>
              ) : (
                friendRequests.map((request) => (
                  <Card key={request.id} className="border-border bg-card">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={request.sender.avatar_url || undefined} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                            {request.sender.username?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">@{request.sender.username}</h3>
                          <p className="text-sm text-muted-foreground">{request.sender.full_name}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleFriendRequest(request.id, true)}>
                            <Check className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleFriendRequest(request.id, false)}>
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="search">
            <Card className="border-border bg-card mb-6">
              <CardHeader>
                <CardTitle>Find Friends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {searchResults.map((user) => (
                <Card key={user.user_id} className="border-border bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                          {user.username?.charAt(0)?.toUpperCase() || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">@{user.username}</h3>
                        <p className="text-sm text-muted-foreground">{user.full_name}</p>
                      </div>
                      <Button onClick={() => sendFriendRequest(user.user_id)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Friend
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Friends;
