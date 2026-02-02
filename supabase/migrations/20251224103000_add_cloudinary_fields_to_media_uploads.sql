/*
  # Add Cloudinary fields to golf_media_uploads
*/

ALTER TABLE golf_media_uploads
  ADD COLUMN IF NOT EXISTS cloudinary_public_id text,
  ADD COLUMN IF NOT EXISTS cloudinary_url text,
  ADD COLUMN IF NOT EXISTS cloudinary_delete_token text,
  ADD COLUMN IF NOT EXISTS cloudinary_resource_type text;
