-- Fix 1: Remove insecure team_members INSERT policy and replace with role-specific policies
DROP POLICY IF EXISTS "Team leaders can add members" ON public.team_members;

-- Allow team creators to add themselves as leader during team creation
CREATE POLICY "Team creators can add themselves as leader"
  ON public.team_members FOR INSERT
  WITH CHECK (
    role = 'leader' AND
    auth.uid() = user_id AND
    auth.uid() IN (SELECT created_by FROM public.teams WHERE id = team_members.team_id)
  );

-- Allow existing team leaders to add regular members
CREATE POLICY "Leaders can add regular members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    role = 'member' AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id
      AND tm.user_id = auth.uid()
      AND tm.role = 'leader'
    )
  );

-- Fix 2: Recreate user_rankings view without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_rankings;

CREATE VIEW public.user_rankings AS
SELECT 
  p.user_id,
  p.username,
  p.avatar_url,
  COALESCE(SUM(ep.points), 0) as total_points,
  COUNT(DISTINCT ep.event_id) as events_participated,
  COUNT(DISTINCT r.event_id) as events_registered,
  RANK() OVER (ORDER BY COALESCE(SUM(ep.points), 0) DESC) as ranking
FROM public.profiles p
LEFT JOIN public.event_participations ep ON p.user_id = ep.user_id
LEFT JOIN public.registrations r ON p.user_id = r.user_id
GROUP BY p.user_id, p.username, p.avatar_url;