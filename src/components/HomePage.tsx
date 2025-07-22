import React from 'react';
import { Plus, Coffee, ArrowRight, RefreshCw, AlertCircle, Clock, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { User, Cafe } from '../types';
import { useHomeData } from '../hooks/useHomeData';
import QuickStatsCard from './QuickStatsCard';
import RecentCafeCard from './RecentCafeCard';

interface HomePageProps {
  user: User;
  onCreateCafe: () => void;
  onBrowseCafes: () => void;
  onSelectCafe: (cafe: Cafe) => void;
  onOpenFocusRoom: () => void;
  onOpenBartenderChat: () => void;
}

const HomePage = ({ user, onCreateCafe, onBrowseCafes, onSelectCafe, onOpenFocusRoom, onOpenBartenderChat }: HomePageProps) => {
  const { stats, recentCafes, loading, error, refetch } = useHomeData(user);

  const handleCafeClick = (recentCafe: {
    id: string;
    name: string;
    description: string;
    theme: string;
    member_count: number;
    host?: { id: string; name: string; avatar_url?: string; email: string; role: string; created_at: string };
  }) => {
    // Convert RecentCafe to Cafe format for compatibility
    const cafe: Cafe = {
      id: recentCafe.id,
      name: recentCafe.name,
      description: recentCafe.description,
      theme: recentCafe.theme,
      host_id: recentCafe.host?.id || '',
      capacity: 50, // Default capacity
      created_at: '',
      current_members: recentCafe.member_count,
      host: recentCafe.host
    };
    onSelectCafe(cafe);
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-orange-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-coffee-medium font-medium">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            {getTimeBasedGreeting()}, {user.name}! ☕
          </h1>
          <p className="text-lg text-text-secondary">
            Welcome back to your virtual café experience
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center space-x-3"
          >
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Retry</span>
            </button>
          </motion.div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-8">
          <QuickStatsCard
            title="Cafés Visited"
            value={stats.totalCafesVisited}
            icon="cafes"
            index={0}
          />
          <QuickStatsCard
            title="Time Spent"
            value={stats.totalTimeSpent}
            icon="time"
            index={1}
          />
          <QuickStatsCard
            title="Current Streak"
            value={`${stats.currentStreak} days`}
            icon="streak"
            index={2}
          />
          <QuickStatsCard
            title="Messages Sent"
            value={stats.totalMessages}
            icon="messages"
            index={3}
          />
          <QuickStatsCard
            title="Sessions Completed"
            value={stats.totalSessionsCompleted}
            icon="sessions"
            index={4}
          />
          <QuickStatsCard
            title="Favorite Theme"
            value={stats.favoriteTheme}
            icon="theme"
            index={5}
          />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-warm-white rounded-2xl p-4 md:p-6 shadow-lg border border-cream-tertiary mb-8"
        >
          <h2 className="text-xl font-semibold text-text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            
            <button
              onClick={onCreateCafe}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              style={{ minHeight: '72px' }}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Create New Café</h3>
                <p className="text-sm opacity-90">Start your own virtual space</p>
              </div>
            </button>

            <button
              onClick={onBrowseCafes}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-coffee-medium to-coffee-light text-text-inverse rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              style={{ minHeight: '72px' }}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Coffee className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Browse Cafés</h3>
                <p className="text-sm opacity-90">Discover new spaces to visit</p>
              </div>
            </button>

            <button
              onClick={onOpenFocusRoom}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              style={{ minHeight: '72px' }}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">Focus Room</h3>
                <p className="text-sm opacity-90">Pomodoro timer with music</p>
              </div>
            </button>

            <button
              onClick={onOpenBartenderChat}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-coffee-medium to-coffee-light text-text-inverse rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
              style={{ minHeight: '72px' }}
            >
              <div className="p-2 bg-white/20 rounded-lg">
                <Bot className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="font-medium">AI Bartender</h3>
                <p className="text-sm opacity-90">Chat with our AI assistant</p>
              </div>
            </button>

            {recentCafes.length > 0 && (
              <button
                onClick={() => handleCafeClick(recentCafes[0])}
                className="flex items-center space-x-3 p-4 bg-gradient-to-r from-coffee-dark to-coffee-medium text-text-inverse rounded-xl hover:shadow-lg transition-all transform hover:scale-105"
                style={{ minHeight: '72px' }}
              >
                <div className="p-2 bg-white/20 rounded-lg">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Continue Last Session</h3>
                  <p className="text-sm opacity-90 truncate max-w-[120px] sm:max-w-[150px]">
                    Return to {recentCafes[0].name}
                  </p>
                </div>
              </button>
            )}
          </div>
        </motion.div>

        {/* Recent Cafés */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-warm-white rounded-2xl p-4 md:p-6 shadow-lg border border-cream-tertiary"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-text-primary">Recent Cafés</h2>
            {recentCafes.length > 0 && (
              <button
                onClick={onBrowseCafes}
                className="text-orange-accent hover:text-orange-accent/80 text-sm font-medium transition-colors"
                style={{ minHeight: '44px' }}
              >
                View All
              </button>
            )}
          </div>

          {recentCafes.length === 0 ? (
            <div className="text-center py-8">
              <Coffee className="h-12 w-12 text-text-muted mx-auto mb-4" />
              <h3 className="text-lg font-medium text-text-secondary mb-2">
                No recent cafés
              </h3>
              <p className="text-text-muted mb-4">
                Start exploring and visiting cafés to see them here
              </p>
              <button
                onClick={onBrowseCafes}
                className="bg-orange-accent text-text-inverse px-6 py-2 rounded-lg hover:bg-orange-accent/90 transition-colors"
                style={{ minHeight: '44px' }}
              >
                Browse Cafés
              </button>
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {recentCafes.map((cafe, index) => (
                <RecentCafeCard
                  key={cafe.id}
                  cafe={cafe}
                  onClick={() => handleCafeClick(cafe)}
                  index={index}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;