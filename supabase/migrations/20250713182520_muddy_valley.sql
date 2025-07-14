/*
  # Enable Realtime for all tables

  1. Enable Realtime
    - Enable realtime for users table
    - Enable realtime for cafes table  
    - Enable realtime for cafe_members table
    - Enable realtime for messages table
    - Enable realtime for orders table

  2. Security
    - Realtime is automatically secured by RLS policies
*/

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE cafes;
ALTER PUBLICATION supabase_realtime ADD TABLE cafe_members;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;