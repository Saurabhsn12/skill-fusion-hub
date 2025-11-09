import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const usernameSchema = z.string()
  .trim()
  .min(4, 'Username must be at least 4 characters')
  .max(30, 'Username too long')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .transform(val => val.toLowerCase());

export const UsernamePrompt = () => {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [suggestedUsername, setSuggestedUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkUsernameStatus();
  }, []);

  const checkUsernameStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name')
      .eq('user_id', user.id)
      .single();

    if (profile && !profile.username) {
      // Generate suggested username from full name
      const suggested = generateUsername(profile.full_name || 'user');
      setSuggestedUsername(suggested);
      setUsername(suggested);
      setOpen(true);
    }
  };

  const generateUsername = (fullName: string): string => {
    const clean = fullName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const random = Math.floor(Math.random() * 999) + 1;
    return `${clean}_${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validatedUsername = usernameSchema.parse(username);

      // Check if username is taken
      const { data: existing } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', validatedUsername)
        .single();

      if (existing) {
        toast({
          title: "Username taken",
          description: "This username is already in use. Please choose another.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from('profiles')
        .update({ username: validatedUsername })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your username has been set.",
      });

      setOpen(false);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid username",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to set username",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Choose Your Username</DialogTitle>
          <DialogDescription>
            Create a unique username to identify yourself on the platform. This will be visible on the leaderboard and your profile.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">@</span>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Min 4 characters, letters, numbers, and underscores only
            </p>
            {suggestedUsername && (
              <p className="text-xs text-muted-foreground">
                Suggestion: @{suggestedUsername}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Setting..." : "Set Username"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
