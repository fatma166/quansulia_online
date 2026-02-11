/*
  # Create Storage Buckets for News and Events

  1. New Storage Buckets
    - `news-images` - For news article images
    - `events-images` - For event images
    
  2. Security
    - Public read access for all images
    - Authenticated staff can upload images
    - Authenticated staff can update/delete their uploaded images
    
  3. Features
    - Support for multiple image formats (jpg, jpeg, png, gif, webp)
    - File size limits
    - Automatic public URL generation
*/

-- Create news-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'news-images',
  'news-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create events-images bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'events-images',
  'events-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for news-images bucket

-- Allow public to view images
CREATE POLICY "Anyone can view news images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'news-images');

-- Allow authenticated staff to upload images
CREATE POLICY "Authenticated staff can upload news images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Allow authenticated staff to update images
CREATE POLICY "Authenticated staff can update news images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Allow authenticated staff to delete images
CREATE POLICY "Authenticated staff can delete news images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'news-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Storage policies for events-images bucket

-- Allow public to view images
CREATE POLICY "Anyone can view events images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'events-images');

-- Allow authenticated staff to upload images
CREATE POLICY "Authenticated staff can upload events images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'events-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Allow authenticated staff to update images
CREATE POLICY "Authenticated staff can update events images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'events-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );

-- Allow authenticated staff to delete images
CREATE POLICY "Authenticated staff can delete events images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'events-images' AND
    EXISTS (
      SELECT 1 FROM staff
      WHERE staff.id = auth.uid()
    )
  );
