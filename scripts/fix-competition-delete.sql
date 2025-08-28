-- Check if there are any entries that might prevent deletion
SELECT 
  c.id,
  c.title,
  COUNT(e.id) as entry_count
FROM competitions c
LEFT JOIN entries e ON c.id = e.competition_id
GROUP BY c.id, c.title
ORDER BY entry_count DESC;

-- Check current RLS policies on competitions table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'competitions';

-- If needed, add missing DELETE policy for admins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'competitions' 
    AND policyname = 'Admins can delete competitions'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete competitions"
    ON public.competitions
    FOR DELETE
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.users
        WHERE auth.uid() = id AND role = ''admin''
      )
    )';
  END IF;
END $$;

-- Verify the policy was created
SELECT 'DELETE policy created successfully' as status;
