/*
  # Fix Storage Policies for News and Events Images

  1. Changes
    - Allow all authenticated users to upload, update, and delete images
    - This includes both staff and super admins
    
  2. Security
    - Still requires authentication
    - Public can only view images
*/

-- Drop existing restrictive policies for news-images
DROP POLICY IF EXISTS "Authenticated staff can upload news images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can update news images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can delete news images" ON storage.objects;

-- Create new permissive policies for news-images
CREATE POLICY "Authenticated users can upload news images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can update news images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'news-images')
  WITH CHECK (bucket_id = 'news-images');

CREATE POLICY "Authenticated users can delete news images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'news-images');

-- Drop existing restrictive policies for events-images
DROP POLICY IF EXISTS "Authenticated staff can upload events images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can update events images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can delete events images" ON storage.objects;

-- Create new permissive policies for events-images
CREATE POLICY "Authenticated users can upload events images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'events-images');

CREATE POLICY "Authenticated users can update events images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'events-images')
  WITH CHECK (bucket_id = 'events-images');

CREATE POLICY "Authenticated users can delete events images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'events-images');
