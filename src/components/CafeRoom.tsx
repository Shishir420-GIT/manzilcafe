import { useState, useEffect } from 'react';
import { ArrowLeft, Users, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Cafe, User as UserType, CafeMember } from '../types';
import Chat from './Chat';
import OrderPanel from './OrderPanel';
import BottomSheet from './BottomSheet';
import { checkRateLimit } from '../lib/rateLimiter';

interface CafeRoomProps {
  cafe: Cafe;
  currentUser: UserType;
  onLeave: () => void;
}

const CafeRoom = ({ cafe, currentUser, onLeave }: CafeRoomProps) => {
  const [members, setMembers] = useState<CafeMember[]>([]);
  const [activeTab, setActiveTab] = useState<'chat' | 'orders'>('chat');
  const [showMemberList, setShowMemberList] = useState(false);

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
      const { data: existingMember, error: memberError } = await supabase
        .from('cafe_members')
        .select('*')
        .eq('cafe_id', cafe.id)
        .eq('user_id', currentUser.id)
        .single();

      if (memberError && memberError.code === 'PGRST116') {
        // No existing member found, insert new membership
        const { error } = await supabase
          .from('cafe_members')
          .insert({
            cafe_id: cafe.id,
            user_id: currentUser.id,
            status: 'active',
          });

        if (error) throw error;
      } else if (existingMember && existingMember.status !== 'active') {
        // Update existing membership to active
        const { error } = await supabase
          .from('cafe_members')
          .update({ status: 'active' })
          .eq('cafe_id', cafe.id)
          .eq('user_id', currentUser.id);

        if (error) throw error;
      }
      // If existingMember exists and status is already 'active', do nothing
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
      {/* Header - Mobile Responsive */}
      <div className="bg-cream-primary shadow-sm border-b border-cream-tertiary p-3 md:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <button
              onClick={onLeave}
              className="p-2 hover:bg-cream-secondary rounded-full transition-colors flex-shrink-0"
              style={{ minHeight: '44px', minWidth: '44px' }}
            >
              <ArrowLeft className="h-5 w-5 text-text-secondary" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-text-primary truncate">{cafe.name}</h1>
              <p className="text-sm text-text-secondary truncate hidden sm:block">{cafe.description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
            {/* Mobile Members Button */}
            <button
              onClick={() => setShowMemberList(true)}
              className="lg:hidden flex items-center space-x-2 text-sm text-text-secondary hover:text-text-primary bg-cream-secondary hover:bg-cream-tertiary px-3 py-2 rounded-lg transition-colors"
              style={{ minHeight: '44px' }}
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{members.length} online</span>
              <span className="sm:hidden">{members.length}</span>
            </button>
            
            {/* Desktop Members Display */}
            <div className="hidden lg:flex items-center space-x-2 text-sm text-text-secondary">
              <Users className="h-4 w-4" />
              <span>{members.length} online</span>
            </div>
            
            {cafe.host_id === currentUser.id && (
              <button 
                className="p-2 hover:bg-cream-secondary rounded-full transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <Settings className="h-5 w-5 text-text-secondary" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="flex space-x-1 mt-4 bg-cream-secondary rounded-lg p-1">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-warm-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={{ minHeight: '48px' }}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              activeTab === 'orders'
                ? 'bg-warm-white text-text-primary shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            style={{ minHeight: '48px' }}
          >
            <span className="hidden sm:inline">Menu & Orders</span>
            <span className="sm:hidden">Orders</span>
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

      {/* Mobile Member List Bottom Sheet */}
      <BottomSheet
        isOpen={showMemberList}
        onClose={() => setShowMemberList(false)}
        title={`Members (${members.length})`}
      >
        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-cream-secondary transition-colors"
              style={{ minHeight: '64px' }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center text-text-inverse text-sm font-medium flex-shrink-0">
                {member.user?.name?.charAt(0).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-base font-medium text-text-primary truncate">
                  {member.user?.name || 'Anonymous'}
                </p>
                {member.user_id === cafe.host_id && (
                  <p className="text-sm text-orange-accent">Host</p>
                )}
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            </div>
          ))}
          {members.length === 0 && (
            <div className="text-center py-8 text-text-muted">
              <Users className="h-12 w-12 mx-auto mb-2" />
              <p>No members online</p>
            </div>
          )}
        </div>
      </BottomSheet>
    </div>
  );
};

export default CafeRoom;