-- Ensure user_rankings view is explicitly set with security_invoker
DROP VIEW IF EXISTS public.user_rankings;

CREATE VIEW public.user_rankings
WITH (security_invoker=on)
AS
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