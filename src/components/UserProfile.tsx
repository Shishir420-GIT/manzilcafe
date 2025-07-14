import { useState, useEffect } from 'react';
import { User, Edit3, Save, X, Camera, Coffee, MessageCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as UserType } from '../types';
import { motion } from 'framer-motion';

interface UserProfileProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
  onClose: () => void;
}

const UserProfile = ({ user, onUpdate, onClose }: UserProfileProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    spacesJoined: 0,
    messagesSent: 0,
    ordersPlaced: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, [user.id]);

  const fetchUserStats = async () => {
    try {
      // Get cafes joined
      const { data: cafesData } = await supabase
        .from('cafe_members')
        .select('id')
        .eq('user_id', user.id);

      // Get messages sent
      const { data: messagesData } = await supabase
        .from('messages')
        .select('id')
        .eq('sender_id', user.id);

      // Get orders placed
      const { data: ordersData } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', user.id);

      setStats({
        spacesJoined: cafesData?.length || 0,
        messagesSent: messagesData?.length || 0,
        ordersPlaced: ordersData?.length || 0
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ name })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      onUpdate(data);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host': return 'bg-purple-100 text-purple-800';
      case 'moderator': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative h-32 bg-gradient-to-br from-amber-600 to-yellow-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        <div className="relative px-6 pb-6">
          <div className="flex items-center justify-center -mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center border-4 border-white">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-amber-600 text-white rounded-full shadow-lg hover:bg-amber-700 transition-colors">
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-center text-xl font-bold border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setName(user.name);
                    }}
                    className="flex items-center space-x-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mb-2">{user.email}</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                  {user.role}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Coffee className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">{stats.spacesJoined}</div>
              <div className="text-xs text-gray-600">Spaces Joined</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">{stats.messagesSent}</div>
              <div className="text-xs text-gray-600">Messages</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-green-600" />
              </div>
              <div className="text-lg font-bold text-gray-800">{stats.ordersPlaced}</div>
              <div className="text-xs text-gray-600">Orders</div>
            </div>
          </div>

          <div className="text-center text-xs text-gray-500">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;