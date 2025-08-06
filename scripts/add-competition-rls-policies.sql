-- Add RLS policy for admins to delete competitions
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

-- Add RLS policy for admins to select competitions (needed for editing)
CREATE POLICY "Admins can select competitions"
ON public.competitions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE auth.uid() = id AND role = 'admin'
  )
);
