/*
  # Create cafe_members table

  1. New Tables
    - `cafe_members`
      - `id` (uuid, primary key)
      - `cafe_id` (uuid, foreign key to cafes)
      - `user_id` (uuid, foreign key to users)
      - `status` (text, default 'active')
      - `joined_at` (timestamp)

  2. Security
    - Enable RLS on `cafe_members` table
    - Add policies for membership management
*/

CREATE TABLE IF NOT EXISTS cafe_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'pending', 'left')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(cafe_id, user_id)
);

ALTER TABLE cafe_members ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read cafe memberships
CREATE POLICY "Anyone can read cafe memberships"
  ON cafe_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to join cafes
CREATE POLICY "Users can join cafes"
  ON cafe_members
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own membership status
CREATE POLICY "Users can update their own membership"
  ON cafe_members
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);