import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Cafe, User as UserType, CafeMember } from '../types';
import Chat from './Chat';
import OrderPanel from './OrderPanel';
import { checkRateLimit } from '../lib/rateLimiter';

interface CafeRoomProps {
  cafe: Cafe;
  currentUser: UserType;
  onLeave: () => void;
}

const CafeRoom = ({ cafe, currentUser, onLeave }: CafeRoomProps) => {
  const [members, setMembers] = useState<CafeMember[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'orders'>('chat');

  useEffect(() => {
    joinCafe();
    fetchMembers();
    subscribeToMembers();

    return () => {
      leaveCafe();
    };
  }, [cafe.id]);

  const joinCafe = async () => {
    try {
      // Check rate limit for cafe joining
      const rateLimitCheck = checkRateLimit(currentUser.id, 'cafe_join');
      if (!rateLimitCheck.allowed) {
        console.warn('Cafe join rate limited:', rateLimitCheck.error);
        return;
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('cafe_members')
        .select('*')
        .eq('cafe_id', cafe.id)
        .eq('user_id', currentUser.id)
        .single();

      if (!existingMember) {
        // Insert new membership
        const { error } = await supabase
          .from('cafe_members')
          .insert({
            cafe_id: cafe.id,
            user_id: currentUser.id,
            status: 'active',
          });

        if (error) throw error;
      } else if (existingMember.status !== 'active') {
        // Update existing membership to active
        const { error } = await supabase
          .from('cafe_members')
          .update({ status: 'active' })
          .eq('cafe_id', cafe.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error joining space:', error);
    }
  };

  const leaveCafe = async () => {
    try {
      const { error } = await supabase
        .from('cafe_members')
        .update({ status: 'left' })
        .eq('cafe_id', cafe.id)
        .eq('user_id', currentUser.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving space:', error);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('cafe_members')
        .select(`
          *,
          user:users(id, name, avatar_url)
        `)
        .eq('cafe_id', cafe.id)
        .eq('status', 'active');

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const subscribeToMembers = () => {
    const channel = supabase
      .channel(`cafe_members:${cafe.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'cafe_members',
          filter: `cafe_id=eq.${cafe.id}`,
        },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="h-screen flex flex-col bg-warm-white">
      {/* Header */}
      <div className="bg-cream-primary shadow-sm border-b border-cream-tertiary p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onLeave}
              className="p-2 hover:bg-cream-secondary rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-text-secondary" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-text-primary">{cafe.name}</h1>
              <p className="text-sm text-text-secondary">{cafe.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Users className="h-4 w-4" />
              <span>{members.length} online</span>
            </div>
            {cafe.host_id === currentUser.id && (
              <button className="p-2 hover:bg-cream-secondary rounded-full transition-colors">
                <Settings className="h-5 w-5 text-text-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mt-4 bg-cream-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-warm-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-warm-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Menu & Orders
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {activeTab === 'chat' ? (
            <Chat cafeId={cafe.id} currentUser={currentUser} />
          ) : (
            <OrderPanel cafeId={cafe.id} userId={currentUser.id} />
          )}
        </div>

        {/* Members Sidebar */}
        <div className="w-64 bg-cream-primary border-l border-cream-tertiary p-4 hidden lg:block">
          <h3 className="text-sm font-medium text-text-secondary mb-3">
            Members ({members.length})
          </h3>
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-cream-secondary"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center text-text-inverse text-sm font-medium">
                  {member.user?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">
                    {member.user?.name || 'Anonymous'}
                  </p>
                  {member.user_id === cafe.host_id && (
                    <p className="text-xs text-orange-accent">Host</p>
                  )}
                </div>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CafeRoom;