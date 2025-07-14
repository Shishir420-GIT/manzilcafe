/*
  # Create cafes table

  1. New Tables
    - `cafes`
      - `id` (uuid, primary key)
      - `host_id` (uuid, foreign key to users)
      - `name` (text)
      - `description` (text)
      - `theme` (text)
      - `capacity` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `cafes` table
    - Add policies for reading cafes and host management
*/

CREATE TABLE IF NOT EXISTS cafes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  theme text DEFAULT 'cozy',
  capacity integer DEFAULT 50 CHECK (capacity > 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cafes
CREATE POLICY "Anyone can read cafes"
  ON cafes
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to create cafes
CREATE POLICY "Authenticated users can create cafes"
  ON cafes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_id);

-- Allow hosts to update their own cafes
CREATE POLICY "Hosts can update their own cafes"
  ON cafes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id);

-- Allow hosts to delete their own cafes
CREATE POLICY "Hosts can delete their own cafes"
  ON cafes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = host_id);