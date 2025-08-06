-- Create a demo admin user
-- First, you need to sign up with an email through the app
-- Then update the email below and run this script

-- IMPORTANT: Replace 'your-email@example.com' with the email you used to sign up
DO $$
DECLARE
    admin_email TEXT := 'admin@limitlessx.com'; -- Change this to your email
    user_exists BOOLEAN;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM public.users WHERE email = admin_email) INTO user_exists;
    
    IF user_exists THEN
        -- Update existing user to admin
        UPDATE public.users 
        SET role = 'admin' 
        WHERE email = admin_email;
        
        RAISE NOTICE 'User % has been made an admin', admin_email;
    ELSE
        RAISE NOTICE 'User with email % not found. Please sign up first, then run this script.', admin_email;
    END IF;
END $$;

-- Insert demo competitions only if they don't exist
INSERT INTO public.competitions (
  title,
  description,
  entry_price,
  max_entries,
  status,
  end_date,
  prize_image_url,
  terms_and_conditions
) 
SELECT * FROM (VALUES 
  (
    'Win a Luxury Rolex Watch',
    'Enter for your chance to win a brand new Rolex Submariner worth £8,000. This iconic timepiece features a black dial, ceramic bezel, and automatic movement. Perfect for the discerning watch enthusiast.',
    5.00,
    1000,
    'active'::competition_status,
    NOW() + INTERVAL '30 days',
    '/placeholder.svg?height=400&width=600&text=Luxury+Rolex+Watch',
    'Must be 18+ to enter. Winner will be selected randomly using a provably fair system. Prize cannot be exchanged for cash. UK residents only.'
  ),
  (
    'iPhone 15 Pro Max Giveaway',
    'Win the latest iPhone 15 Pro Max 256GB in Titanium Blue. Includes original packaging, charger, and full 1-year Apple warranty. The most advanced iPhone ever created.',
    2.50,
    2000,
    'active'::competition_status,
    NOW() + INTERVAL '14 days',
    '/placeholder.svg?height=400&width=600&text=iPhone+15+Pro+Max',
    'UK residents only. Winner must provide valid ID for verification. Device will be shipped within 5 business days of winner confirmation.'
  ),
  (
    '£1000 Cash Prize',
    'Pure cash prize - £1000 transferred directly to your bank account or PayPal. No strings attached, no conditions. Use it however you want!',
    10.00,
    500,
    'active'::competition_status,
    NOW() + INTERVAL '7 days',
    '/placeholder.svg?height=400&width=600&text=£1000+Cash+Prize',
    'Winner will receive payment within 5 business days of verification. Must provide valid bank details or PayPal email.'
  ),
  (
    'Luxury Perfume Collection',
    'Win an exclusive collection of 5 luxury perfumes including Chanel No.5, Tom Ford Black Orchid, and Creed Aventus. Total value over £500.',
    3.00,
    800,
    'active'::competition_status,
    NOW() + INTERVAL '21 days',
    '/placeholder.svg?height=400&width=600&text=Luxury+Perfume+Collection',
    'Collection includes full-size bottles. Must be 18+ to enter. Shipping included to UK addresses.'
  )
) AS new_competitions(title, description, entry_price, max_entries, status, end_date, prize_image_url, terms_and_conditions)
WHERE NOT EXISTS (
  SELECT 1 FROM public.competitions WHERE title = new_competitions.title
);

-- Show confirmation
DO $$
DECLARE
    comp_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO comp_count FROM public.competitions;
    RAISE NOTICE 'Database setup complete. Total competitions: %', comp_count;
END $$;
