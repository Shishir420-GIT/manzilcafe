import { useState, useEffect } from 'react';
import { Edit3, X, Camera, Coffee, MessageCircle, Clock, Globe } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { User as UserType } from '../types';
import { motion } from 'framer-motion';
import ProfileEditModal from './ProfileEditModal';

interface UserProfileProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
  onClose: () => void;
}

const UserProfile = ({ user, onUpdate, onClose }: UserProfileProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
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

  const handleProfileUpdate = (updatedUser: UserType) => {
    onUpdate(updatedUser);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'host': return 'bg-orange-accent/20 text-orange-accent';
      case 'moderator': return 'bg-info/20 text-info';
      default: return 'bg-cream-secondary text-text-secondary';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-warm-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        <div className="relative h-32 bg-gradient-to-br from-orange-accent to-golden-accent">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-text-inverse" />
          </button>
        </div>

        <div className="relative px-6 pb-6">
          <div className="flex items-center justify-center -mt-16 mb-4">
            <div className="relative">
              <div className="w-24 h-24 bg-warm-white rounded-full shadow-lg flex items-center justify-center border-4 border-warm-white">
                {user.user_profiles?.profile_picture_url || user.avatar_url ? (
                  <img
                    src={user.user_profiles?.profile_picture_url || user.avatar_url}
                    alt={user.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center text-text-inverse text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-0 right-0 p-2 bg-orange-accent text-text-inverse rounded-full shadow-lg hover:bg-orange-accent/90 transition-colors"
                title="Edit Profile"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <h2 className="text-xl font-bold text-text-primary">{user.name}</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="p-1 text-text-muted hover:text-text-secondary transition-colors"
                title="Edit Profile"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <p className="text-text-secondary text-sm mb-2">{user.email}</p>
            
            {/* Bio Section */}
            {user.user_profiles?.bio && (
              <div className="bg-cream-secondary rounded-lg p-3 mb-3 max-w-xs mx-auto">
                <p className="text-text-secondary text-sm italic">"{user.user_profiles.bio}"</p>
              </div>
            )}
            
            {/* Profile Completion Status */}
            {user.user_profiles && !user.user_profiles.profile_completed && (
              <div className="bg-golden-accent/20 border border-golden-accent/30 rounded-lg p-2 mb-3 max-w-xs mx-auto">
                <p className="text-golden-accent text-xs font-medium">
                  Complete your profile to unlock all features
                </p>
              </div>
            )}
            
            {/* Timezone */}
            {user.user_profiles?.timezone && (
              <div className="flex items-center justify-center space-x-1 text-text-muted text-xs mb-2">
                <Globe className="h-3 w-3" />
                <span>{user.user_profiles.timezone}</span>
              </div>
            )}
            
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
              {user.role}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-cream-secondary rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Coffee className="h-4 w-4 text-orange-accent" />
              </div>
              <div className="text-lg font-bold text-text-primary">{stats.spacesJoined}</div>
              <div className="text-xs text-text-secondary">Spaces Joined</div>
            </div>
            <div className="text-center p-3 bg-cream-secondary rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <MessageCircle className="h-4 w-4 text-coffee-medium" />
              </div>
              <div className="text-lg font-bold text-text-primary">{stats.messagesSent}</div>
              <div className="text-xs text-text-secondary">Messages</div>
            </div>
            <div className="text-center p-3 bg-cream-secondary rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Clock className="h-4 w-4 text-golden-accent" />
              </div>
              <div className="text-lg font-bold text-text-primary">{stats.ordersPlaced}</div>
              <div className="text-xs text-text-secondary">Orders</div>
            </div>
          </div>

          <div className="text-center text-xs text-text-muted">
            Member since {new Date(user.created_at).toLocaleDateString()}
          </div>
        </div>
      </motion.div>

      {/* Profile Edit Modal */}
      <ProfileEditModal
        user={user}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default UserProfile;