import { Coffee, Clock, TrendingUp, MessageCircle, ShoppingBag, Heart, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuickStatsCardProps {
  title: string;
  value: string | number;
  icon: 'cafes' | 'time' | 'streak' | 'messages' | 'orders' | 'theme' | 'sessions';
  subtitle?: string;
  index: number;
}

const QuickStatsCard = ({ title, value, icon, subtitle, index }: QuickStatsCardProps) => {
  const getIcon = () => {
    const iconClass = "h-6 w-6";
    
    switch (icon) {
      case 'cafes':
        return <Coffee className={`${iconClass} text-orange-accent`} />;
      case 'time':
        return <Clock className={`${iconClass} text-coffee-medium`} />;
      case 'streak':
        return <TrendingUp className={`${iconClass} text-golden-accent`} />;
      case 'messages':
        return <MessageCircle className={`${iconClass} text-info`} />;
      case 'orders':
        return <ShoppingBag className={`${iconClass} text-success`} />;
      case 'sessions':
        return <CheckCircle className={`${iconClass} text-success`} />;
      case 'theme':
        return <Heart className={`${iconClass} text-error`} />;
      default:
        return <Coffee className={`${iconClass} text-orange-accent`} />;
    }
  };

  const getValueColor = () => {
    switch (icon) {
      case 'cafes':
        return 'text-orange-accent';
      case 'time':
        return 'text-coffee-medium';
      case 'streak':
        return 'text-golden-accent';
      case 'messages':
        return 'text-info';
      case 'orders':
        return 'text-success';
      case 'theme':
        return 'text-error';
      default:
        return 'text-orange-accent';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="bg-warm-white rounded-xl p-6 shadow-lg border border-cream-tertiary hover:shadow-xl transition-all duration-300 hover:scale-105"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="p-3 bg-cream-secondary rounded-lg">
          {getIcon()}
        </div>
      </div>
      
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
          {title}
        </h3>
        <p className={`text-2xl font-bold ${getValueColor()}`}>
          {value}
        </p>
        {subtitle && (
          <p className="text-xs text-text-muted capitalize">
            {subtitle}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default QuickStatsCard;