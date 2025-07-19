export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'visitor' | 'host' | 'moderator';
  created_at: string;
  user_profiles?: UserProfile;
}

export interface UserProfile {
  id: string;
  user_id: string;
  profile_completed: boolean;
  profile_picture_url?: string;
  bio?: string;
  timezone?: string;
  notification_preferences?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface Cafe {
  id: string;
  host_id: string;
  name: string;
  description: string;
  theme: string;
  capacity: number;
  created_at: string;
  current_members?: number;
  host?: User;
}

export interface Message {
  id: string;
  cafe_id: string;
  sender_id: string;
  content: string;
  message_type: 'user' | 'ai' | 'system' | 'voice';
  timestamp: string;
  audio_data?: string;
  sender?: User;
}

export interface Order {
  id: string;
  cafe_id: string;
  user_id: string;
  item_name: string;
  quantity: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  timestamp: string;
  user?: User;
}

export interface CafeMember {
  id: string;
  cafe_id: string;
  user_id: string;
  status: 'active' | 'pending' | 'left';
  joined_at: string;
  user?: User;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'tea' | 'pastry' | 'snack';
  image_url?: string;
}