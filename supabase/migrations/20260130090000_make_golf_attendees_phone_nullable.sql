/*
  # Make phone number optional for golf_attendees

  The RSVP form no longer collects phone numbers, so allow NULL values.
*/

ALTER TABLE golf_attendees
  ALTER COLUMN phone DROP NOT NULL;
