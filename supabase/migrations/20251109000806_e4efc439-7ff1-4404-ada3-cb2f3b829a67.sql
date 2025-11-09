-- Create role enum if not exists
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'organizer', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Automatically assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add event statistics tracking
CREATE TABLE IF NOT EXISTS public.event_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  placement INTEGER,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, event_id)
);

ALTER TABLE public.event_participations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own participations" ON public.event_participations;
CREATE POLICY "Users can view their own participations"
  ON public.event_participations FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Event organizers can manage participations" ON public.event_participations;
CREATE POLICY "Event organizers can manage participations"
  ON public.event_participations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = event_participations.event_id
      AND events.created_by = auth.uid()
    )
  );

-- Add user rankings view
CREATE OR REPLACE VIEW public.user_rankings AS
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

-- Improve events table with file validation
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS max_file_size INTEGER DEFAULT 5242880;

-- Add image validation to storage policies
DROP POLICY IF EXISTS "Limit avatar upload size" ON storage.objects;
CREATE POLICY "Limit avatar upload size"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (octet_length(CONVERT_TO(name, 'UTF8')) < 255) AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Limit event ads upload size" ON storage.objects;
CREATE POLICY "Limit event ads upload size"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'event-ads' AND
    (octet_length(CONVERT_TO(name, 'UTF8')) < 255)
  );