/*
  # Add DELETE policy for golf attendees

  1. Changes
    - Add DELETE policy to allow removal of attendee records
    - This enables admin functionality to delete registrations
  
  2. Security
    - Policy allows authenticated and anonymous users to delete records
    - In production, this should be restricted to admin users only
*/

CREATE POLICY "Allow deletion of attendee records"
  ON golf_attendees
  FOR DELETE
  TO anon, authenticated
  USING (true);