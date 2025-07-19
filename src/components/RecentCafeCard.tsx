import { Users, Crown, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { RecentCafe } from '../types';

interface RecentCafeCardProps {
  cafe: RecentCafe;
  onClick: () => void;
  index: number;
}

const RecentCafeCard = ({ cafe, onClick, index }: RecentCafeCardProps) => {
  const formatLastVisited = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const getThemeColors = (theme: string) => {
    switch (theme) {
      case 'cozy':
        return {
          bg: 'bg-gradient-to-br from-orange-accent/10 to-golden-accent/10',
          border: 'border-orange-accent/20',
          accent: 'text-orange-accent'
        };
      case 'modern':
        return {
          bg: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10',
          border: 'border-blue-500/20',
          accent: 'text-blue-600'
        };
      case 'rustic':
        return {
          bg: 'bg-gradient-to-br from-amber-600/10 to-yellow-600/10',
          border: 'border-amber-600/20',
          accent: 'text-amber-700'
        };
      case 'minimalist':
        return {
          bg: 'bg-gradient-to-br from-gray-400/10 to-gray-600/10',
          border: 'border-gray-400/20',
          accent: 'text-gray-600'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-orange-accent/10 to-golden-accent/10',
          border: 'border-orange-accent/20',
          accent: 'text-orange-accent'
        };
    }
  };

  const themeColors = getThemeColors(cafe.theme);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      onClick={onClick}
      className={`${themeColors.bg} ${themeColors.border} border rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 min-w-[250px] flex-shrink-0`}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-text-primary text-sm truncate max-w-[140px]">
              {cafe.name}
            </h3>
            {cafe.isOwner && (
              <Crown className="h-4 w-4 text-golden-accent" title="You own this café" />
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full bg-white/60 ${themeColors.accent} capitalize font-medium`}>
            {cafe.theme}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
          {cafe.description}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>{formatLastVisited(cafe.last_visited)}</span>
          </div>
          
          {cafe.member_count > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{cafe.member_count}</span>
            </div>
          )}
        </div>

        {/* Host info */}
        {cafe.host && !cafe.isOwner && (
          <div className="flex items-center space-x-2 pt-2 border-t border-white/30">
            <div className="w-4 h-4 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-medium">
                {cafe.host.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Hosted by {cafe.host.name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentCafeCard;