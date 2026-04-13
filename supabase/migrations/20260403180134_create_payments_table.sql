/*
  # Create Payments Table

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `rider_id` (uuid, foreign key to riders)
      - `period_start` (date)
      - `period_end` (date)
      - `base_amount` (numeric)
      - `total_fines` (numeric)
      - `net_amount` (numeric)
      - `status` (text, pending/paid)
      - `paid_date` (date)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Add policy for authenticated admins to read all payments
    - Add policy for authenticated admins to create payments
    - Add policy for authenticated admins to update payments
*/

CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rider_id uuid NOT NULL REFERENCES riders(id) ON DELETE CASCADE,
  period_start date NOT NULL,
  period_end date NOT NULL,
  base_amount numeric DEFAULT 0,
  total_fines numeric DEFAULT 0,
  net_amount numeric DEFAULT 0,
  status text DEFAULT 'pending',
  paid_date date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX idx_payments_rider_id ON payments(rider_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_period_start ON payments(period_start);
