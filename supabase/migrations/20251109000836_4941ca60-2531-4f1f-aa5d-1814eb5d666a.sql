-- Drop and recreate the view with security_invoker enabled
DROP VIEW IF EXISTS public.user_rankings;

CREATE VIEW public.user_rankings
WITH (security_invoker=on)
AS
SELECT 
  p.user_id,
  p.full_name,
  p.avatar_url,
  COUNT(DISTINCT ep.event_id) as events_participated,
  COUNT(DISTINCT r.event_id) as events_registered,
  COALESCE(SUM(ep.points), 0) as total_points,
  RANK() OVER (ORDER BY COALESCE(SUM(ep.points), 0) DESC) as ranking
FROM public.profiles p
LEFT JOIN public.event_participations ep ON p.user_id = ep.user_id
LEFT JOIN public.registrations r ON p.user_id = r.user_id
GROUP BY p.user_id, p.full_name, p.avatar_url;