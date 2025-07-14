import { createClient } from '@supabase/supabase-js';

// Note: These will be provided when you connect to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Menu items data
export const menuItems = [
  {
    id: '1',
    name: 'Espresso',
    description: 'Rich and bold single shot',
    price: 2.50,
    category: 'coffee' as const,
    image_url: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '2', 
    name: 'Cappuccino',
    description: 'Creamy foam with espresso',
    price: 4.00,
    category: 'coffee' as const,
    image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '3',
    name: 'Croissant',
    description: 'Buttery, flaky pastry',
    price: 3.50,
    category: 'pastry' as const,
    image_url: 'https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '4',
    name: 'Green Tea',
    description: 'Soothing herbal blend',
    price: 2.75,
    category: 'tea' as const,
    image_url: 'https://images.pexels.com/photos/1638280/pexels-photo-1638280.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];