-- Add featured competition functionality
ALTER TABLE public.competitions 
ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;

-- Create index for featured competitions
CREATE INDEX IF NOT EXISTS idx_competitions_featured ON public.competitions(is_featured);

-- Update RLS policy to allow viewing featured competitions
DROP POLICY IF EXISTS "Anyone can view active competitions" ON public.competitions;
CREATE POLICY "Anyone can view active competitions" ON public.competitions
  FOR SELECT USING (
    status = 'active' OR 
    is_featured = TRUE OR 
    auth.uid() IN (
      SELECT id FROM public.users WHERE role = 'admin'
    )
  );

-- Function to ensure only one competition is featured at a time
CREATE OR REPLACE FUNCTION ensure_single_featured_competition()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a competition as featured, unfeature all others
  IF NEW.is_featured = TRUE THEN
    UPDATE public.competitions 
    SET is_featured = FALSE 
    WHERE id != NEW.id AND is_featured = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for featured competition
DROP TRIGGER IF EXISTS on_competition_featured ON public.competitions;
CREATE TRIGGER on_competition_featured
  BEFORE UPDATE ON public.competitions
  FOR EACH ROW 
  WHEN (NEW.is_featured IS DISTINCT FROM OLD.is_featured)
  EXECUTE FUNCTION ensure_single_featured_competition();

-- Set the newest active competition as featured by default
UPDATE public.competitions 
SET is_featured = TRUE 
WHERE id = (
  SELECT id FROM public.competitions 
  WHERE status = 'active' 
  ORDER BY created_at DESC 
  LIMIT 1
);
