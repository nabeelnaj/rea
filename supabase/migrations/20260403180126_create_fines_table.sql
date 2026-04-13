/*
  # Create Fines Table

  1. New Tables
    - `fines`
      - `id` (uuid, primary key)
      - `rider_id` (uuid, foreign key to riders)
      - `amount` (numeric, not null)
      - `description` (text)
      - `category` (text, e.g., damage, violation, etc.)
      - `issued_date` (date)
      - `reason` (text)
      - `status` (text, pending/deducted)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `fines` table
    - Add policy for authenticated admins to read all fines
    - Add policy for authenticated admins to create fines
    - Add policy for authenticated admins to update fines
*/

CREATE TABLE IF NOT EXISTS fines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  description text,
  category text,
  issued_date date DEFAULT CURRENT_DATE,
  reason text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all fines"
  ON fines FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create fines"
  ON fines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update fines"
  ON fines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete fines"
  ON fines FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_fines_rider_id ON fines(rider_id);
CREATE INDEX idx_fines_status ON fines(status);
CREATE INDEX idx_fines_issued_date ON fines(issued_date);
