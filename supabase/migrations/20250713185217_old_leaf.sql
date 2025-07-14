/*
  # Fix messages table structure

  1. Update messages table
    - Add audio_data column for voice messages
    - Update message_type to include 'voice'
    - Ensure proper foreign key handling for sender_id
*/

-- Add audio_data column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'messages' AND column_name = 'audio_data'
    ) THEN
        ALTER TABLE messages ADD COLUMN audio_data text;
    END IF;
END $$;

-- Update message_type constraint to include 'voice'
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_message_type_check 
    CHECK (message_type IN ('user', 'ai', 'system', 'voice'));

-- Create a function to handle sender lookup for messages
CREATE OR REPLACE FUNCTION get_message_sender(sender_id text)
RETURNS json AS $$
BEGIN
    IF sender_id = 'ai-bartender' THEN
        RETURN json_build_object(
            'id', 'ai-bartender',
            'name', 'AI Bartender',
            'avatar_url', null
        );
    ELSE
        RETURN (
            SELECT json_build_object(
                'id', u.id,
                'name', u.name,
                'avatar_url', u.avatar_url
            )
            FROM users u
            WHERE u.id::text = sender_id
        );
    END IF;
END;
$$ LANGUAGE plpgsql;