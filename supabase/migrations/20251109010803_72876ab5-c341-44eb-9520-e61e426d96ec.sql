-- Fix 6: Username Nullable Issue - Generate usernames for existing null values and make NOT NULL
-- First, generate unique usernames for any profiles with null username
UPDATE public.profiles
SET username = 'user_' || substring(user_id::text, 1, 8)
WHERE username IS NULL;

-- Now make username NOT NULL
ALTER TABLE public.profiles
ALTER COLUMN username SET NOT NULL;

-- Fix 1: Friend Request Deletion - Add RLS policy for senders to delete their own requests
CREATE POLICY "Users can delete their own sent friend requests"
ON public.friend_requests
FOR DELETE
USING (auth.uid() = sender_id AND status = 'pending');