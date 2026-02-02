/*
  # Create After Party Attendees Table

  1. New Tables
    - `after_party_attendees`
      - `id` (uuid, primary key) - Unique identifier for each attendee
      - `name` (text, required) - Attendee's full name
      - `phone` (text, optional) - Contact phone number (not required for after party)
      - `attendance_status` (text, required) - 'attending' or 'not_attending'
      - `comment` (text, optional) - Additional comments from attendee
      - `created_at` (timestamptz) - Timestamp of registration
*/

CREATE TABLE IF NOT EXISTS public.after_party_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  attendance_status text NOT NULL CHECK (attendance_status IN ('attending', 'not_attending')),
  comment text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.after_party_attendees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register for after party"
  ON public.after_party_attendees
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can view after party attendees"
  ON public.after_party_attendees
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow deletion of after party attendee records"
  ON public.after_party_attendees
  FOR DELETE
  TO anon, authenticated
  USING (true);
