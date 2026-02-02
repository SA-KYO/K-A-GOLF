/*
  # Allow public delete for media uploads

  - Needed for admin delete actions using the anon key
*/

CREATE POLICY "Anyone can delete golf media metadata"
  ON golf_media_uploads
  FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public can delete kiramucup media"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'kiramucup-uploads');
