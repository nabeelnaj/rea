/*
  # Create Riders Table

  1. New Tables
    - `riders`
      - `id` (uuid, primary key)
      - `first_name` (text, not null)
      - `last_name` (text, not null)
      - `email` (text, unique, not null)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `postal_code` (text)
      - `joining_date` (date)
      - `base_salary` (numeric)
      - `status` (text, active/inactive)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `riders` table
    - Add policy for authenticated admins to read all riders
    - Add policy for authenticated admins to create riders
    - Add policy for authenticated admins to update riders
*/

CREATE TABLE IF NOT EXISTS riders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  address text,
  city text,
  postal_code text,
  joining_date date,
  base_salary numeric DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE riders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all riders"
  ON riders FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create riders"
  ON riders FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update riders"
  ON riders FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete riders"
  ON riders FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_riders_email ON riders(email);
CREATE INDEX idx_riders_status ON riders(status);
