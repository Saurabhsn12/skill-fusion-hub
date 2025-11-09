-- Add username to profiles table
ALTER TABLE public.profiles
ADD COLUMN username text UNIQUE;

-- Create index for username lookups
CREATE INDEX idx_profiles_username ON public.profiles(username);

-- Create enum for friend request status
CREATE TYPE public.friend_request_status AS ENUM ('pending', 'accepted', 'rejected');

-- Create friend_requests table
CREATE TABLE public.friend_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status friend_request_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT no_self_friend_request CHECK (sender_id != receiver_id),
  CONSTRAINT unique_friend_request UNIQUE (sender_id, receiver_id)
);

-- Create index for friend request lookups
CREATE INDEX idx_friend_requests_receiver ON public.friend_requests(receiver_id, status);
CREATE INDEX idx_friend_requests_sender ON public.friend_requests(sender_id, status);

-- Enable RLS on friend_requests
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for friend_requests
CREATE POLICY "Users can view their own friend requests"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send friend requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update received friend requests"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Create teams table
CREATE TABLE public.teams (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  logo_url text,
  description text,
  created_by uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- RLS policies for teams
CREATE POLICY "Teams are viewable by everyone"
  ON public.teams FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Team creators can update their teams"
  ON public.teams FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Team creators can delete their teams"
  ON public.teams FOR DELETE
  USING (auth.uid() = created_by);

-- Create enum for team member role
CREATE TYPE public.team_role AS ENUM ('leader', 'member');

-- Create team_members table
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  role team_role NOT NULL DEFAULT 'member',
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- Enable RLS on team_members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- RLS policies for team_members
CREATE POLICY "Team members are viewable by everyone"
  ON public.team_members FOR SELECT
  USING (true);

CREATE POLICY "Team leaders can add members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

CREATE POLICY "Team leaders can remove members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- Create trigger for updating friend_requests updated_at
CREATE TRIGGER update_friend_requests_updated_at
  BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updating teams updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 2026 events
INSERT INTO public.events (
  title,
  event_type,
  description,
  event_date,
  event_time,
  location,
  campus,
  organizer_name,
  max_participants,
  is_paid,
  price,
  created_by
) VALUES
  (
    'Campus Coding Challenge 2026',
    'Tech',
    'National-level coding event for students. Test your programming skills against the best minds in the country.',
    '2026-03-15',
    '10:00:00',
    'Tech Hub Auditorium',
    'Main Campus',
    'Skill Fusion Tech Team',
    100,
    true,
    299,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'BGMI Battleground Masters 2026',
    'Gaming',
    'BGMI tournament open to all players. Show your battle royale skills and win amazing prizes.',
    '2026-04-20',
    '14:00:00',
    'Gaming Arena',
    'Main Campus',
    'Skill Fusion Gaming',
    64,
    true,
    199,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'Inter-University Hackathon 2026',
    'Tech',
    'Innovation challenge for universities. Build the next big thing in 48 hours.',
    '2026-06-10',
    '09:00:00',
    'Innovation Center',
    'Main Campus',
    'Skill Fusion Innovation Lab',
    150,
    true,
    499,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'Skill Fusion Sports Meet 2026',
    'Sports',
    'Sports event including cricket, football, and volleyball. Compete for the championship trophy.',
    '2026-08-05',
    '08:00:00',
    'University Sports Complex',
    'Main Campus',
    'Skill Fusion Sports Club',
    200,
    false,
    0,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'Chess League 2026',
    'Strategy',
    'Online and offline chess tournaments. Prove your strategic mastery on the board.',
    '2026-09-12',
    '15:00:00',
    'Conference Hall',
    'Main Campus',
    'Skill Fusion Chess Club',
    50,
    true,
    149,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'E-Sports Grand Arena 2026',
    'Gaming',
    'Multi-game e-sports competition. Compete in multiple games including Valorant, CS:GO, and more.',
    '2026-11-18',
    '12:00:00',
    'E-Sports Arena',
    'Main Campus',
    'Skill Fusion E-Sports',
    128,
    true,
    399,
    (SELECT user_id FROM public.profiles LIMIT 1)
  ),
  (
    'Fusion Fest 2026',
    'Cultural',
    'Cultural and music festival for all campuses. Celebrate diversity with performances, food, and fun.',
    '2026-12-20',
    '16:00:00',
    'Open Ground',
    'All Campuses',
    'Skill Fusion Cultural Committee',
    500,
    false,
    0,
    (SELECT user_id FROM public.profiles LIMIT 1)
  );

-- Update user_rankings view to use username instead of full_name
DROP VIEW IF EXISTS public.user_rankings;
CREATE VIEW public.user_rankings AS
SELECT 
  p.user_id,
  p.username,
  p.avatar_url,
  COALESCE(SUM(ep.points), 0) AS total_points,
  COUNT(DISTINCT ep.event_id) AS events_participated,
  COUNT(DISTINCT r.event_id) AS events_registered,
  ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(ep.points), 0) DESC) AS ranking
FROM public.profiles p
LEFT JOIN public.event_participations ep ON p.user_id = ep.user_id
LEFT JOIN public.registrations r ON p.user_id = r.user_id
GROUP BY p.user_id, p.username, p.avatar_url;