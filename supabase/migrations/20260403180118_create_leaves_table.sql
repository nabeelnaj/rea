/*
  # Create Leaves Table

  1. New Tables
    - `leaves`
      - `id` (uuid, primary key)
      - `rider_id` (uuid, foreign key to riders)
      - `start_date` (date, not null)
      - `end_date` (date, not null)
      - `reason` (text)
      - `status` (text, pending/approved/rejected)
      - `requested_at` (timestamptz)
      - `approved_at` (timestamptz)
      - `approved_by` (uuid, foreign key to auth.users)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `leaves` table
    - Add policy for authenticated admins to read all leaves
    - Add policy for authenticated admins to create leaves
    - Add policy for authenticated admins to update leaves
*/

CREATE TABLE IF NOT EXISTS leaves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  end_date date NOT NULL,
  reason text,
  status text DEFAULT 'pending',
  requested_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE leaves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all leaves"
  ON leaves FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create leaves"
  ON leaves FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update leaves"
  ON leaves FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete leaves"
  ON leaves FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_leaves_rider_id ON leaves(rider_id);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_leaves_start_date ON leaves(start_date);
