/*
  # Create Golf Media Uploads

  1. New Tables
    - `golf_media_uploads`
      - `id` (uuid, primary key) - Unique identifier for each upload
      - `uploader_name` (text, optional) - Optional uploader name
      - `comment` (text, optional) - Optional message
      - `file_path` (text, required) - Storage path
      - `original_name` (text, required) - Original filename
      - `file_type` (text, optional) - MIME type
      - `file_size` (bigint, optional) - File size in bytes
      - `created_at` (timestamptz) - Timestamp of upload

  2. Storage
    - Bucket `kiramucup-uploads` for images and videos

  3. Security
    - Enable RLS on `golf_media_uploads`
    - Allow public inserts/selects for uploads
    - Allow public storage upload/read in the bucket
*/

CREATE TABLE IF NOT EXISTS golf_media_uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uploader_name text,
  comment text,
  file_path text NOT NULL,
  original_name text NOT NULL,
  file_type text,
  file_size bigint,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE golf_media_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can upload golf media metadata"
  ON golf_media_uploads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view golf media metadata"
  ON golf_media_uploads
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('kiramucup-uploads', 'kiramucup-uploads', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can upload kiramucup media"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'kiramucup-uploads');

CREATE POLICY "Public can read kiramucup media"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'kiramucup-uploads');
