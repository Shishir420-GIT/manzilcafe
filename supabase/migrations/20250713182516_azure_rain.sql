/*
  # Create orders table

  1. New Tables
    - `orders`
      - `id` (uuid, primary key)
      - `cafe_id` (uuid, foreign key to cafes)
      - `user_id` (uuid, foreign key to users)
      - `item_name` (text)
      - `quantity` (integer)
      - `price` (numeric)
      - `status` (text, default 'pending')
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on `orders` table
    - Add policies for order management
*/

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cafe_id uuid REFERENCES cafes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  item_name text NOT NULL,
  quantity integer DEFAULT 1 CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  timestamp timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read orders
CREATE POLICY "Anyone can read orders"
  ON orders
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to place orders
CREATE POLICY "Users can place orders"
  ON orders
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own orders
CREATE POLICY "Users can update their own orders"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);