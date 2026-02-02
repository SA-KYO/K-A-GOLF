/*
  # Create Golf Competition Attendees Table

  1. New Tables
    - `golf_attendees`
      - `id` (uuid, primary key) - Unique identifier for each attendee
      - `name` (text, required) - Attendee's full name
      - `phone` (text, required) - Contact phone number
      - `attendance_status` (text, required) - 'attending' or 'not_attending'
      - `comment` (text, optional) - Additional comments from attendee
      - `created_at` (timestamptz) - Timestamp of registration
  
  2. Security
    - Enable RLS on `golf_attendees` table
    - Add policy for anyone to insert their registration (public event)
    - Add policy for anyone to view attendee count and list (public event)
  
  3. Notes
    - This is a public golf competition event where anyone can register
    - Phone numbers are collected for contact purposes
    - Attendance status helps organizers plan appropriately
*/

CREATE TABLE IF NOT EXISTS golf_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  attendance_status text NOT NULL CHECK (attendance_status IN ('attending', 'not_attending')),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE golf_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for golf competition"
  ON golf_attendees
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view golf attendees"
  ON golf_attendees
  FOR SELECT
  TO anon, authenticated
  USING (true);