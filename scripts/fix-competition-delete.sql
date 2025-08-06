-- Check if there are any entries preventing deletion
SELECT c.id, c.title, COUNT(e.id) as entry_count
FROM public.competitions c
LEFT JOIN public.entries e ON c.id = e.competition_id
GROUP BY c.id, c.title
ORDER BY entry_count DESC;

-- Add proper delete policy (replace existing if needed)
DROP POLICY IF EXISTS "Admins can delete competitions" ON public.competitions;

CREATE POLICY "Admins can delete competitions"
ON public.competitions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = id AND role = 'admin'
  )
);

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'competitions';
