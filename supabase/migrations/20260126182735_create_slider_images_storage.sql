/*
  # Create Slider Images Storage Bucket

  1. Storage
    - Create `slider-images` bucket for storing hero slider images
    - Enable public access for viewing images
    - Set up RLS policies for authenticated staff to upload

  2. Security
    - Public can view images
    - Only authenticated staff can upload/delete images
*/

-- Create storage bucket for slider images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'slider-images',
  'slider-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Public can view slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can upload slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can update slider images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated staff can delete slider images" ON storage.objects;

-- Allow public to view slider images
CREATE POLICY "Public can view slider images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'slider-images');

-- Allow authenticated staff to upload slider images
CREATE POLICY "Authenticated staff can upload slider images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'slider-images');

-- Allow authenticated staff to update slider images
CREATE POLICY "Authenticated staff can update slider images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'slider-images');

-- Allow authenticated staff to delete slider images
CREATE POLICY "Authenticated staff can delete slider images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'slider-images');