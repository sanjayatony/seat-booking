-- Run this in the Supabase SQL Editor

CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email TEXT NOT NULL,
  kid_name TEXT NOT NULL,
  seat_a TEXT NOT NULL,
  seat_b TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read bookings"
  ON bookings FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert bookings"
  ON bookings FOR INSERT
  WITH CHECK (true);
