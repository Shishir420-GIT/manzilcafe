/*
  # Create messages table

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `cafe_id` (uuid, foreign key to cafes)
      - `sender_id` (uuid, foreign key to users, or text for AI)
      - `content` (text)
      - `message_type` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on `messages` table
    - Add policies for message management
*/

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
  sender_id text NOT NULL, -- Keep as text to accommodate both user IDs and 'ai-bartender'
  content text NOT NULL,
  message_type text DEFAULT 'user' CHECK (message_type IN ('user', 'ai', 'system', 'voice')),
  timestamp timestamptz DEFAULT now(),
  audio_data text -- For voice messages
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read messages
CREATE POLICY "Anyone can read messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users and AI to send messages
CREATE POLICY "Users and AI can send messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid()::text = sender_id OR 
    sender_id = 'ai-bartender'
  );