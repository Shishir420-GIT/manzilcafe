import { motion } from 'framer-motion';
import { Users, Clock, Star, ArrowRight } from 'lucide-react';
import { Cafe } from '../types';

interface CafeCardProps {
  cafe: Cafe;
  onClick: () => void;
}

const CafeCard = ({ cafe, onClick }: CafeCardProps) => {
  const themes = {
    cozy: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=800',
    modern: 'https://images.pexels.com/photos/1002740/pexels-photo-1002740.jpeg?auto=compress&cs=tinysrgb&w=800',
    rustic: 'https://images.pexels.com/photos/1797113/pexels-photo-1797113.jpeg?auto=compress&cs=tinysrgb&w=800',
    elegant: 'https://images.pexels.com/photos/1183021/pexels-photo-1183021.jpeg?auto=compress&cs=tinysrgb&w=800'
  };

  const themeImage = themes[cafe.theme as keyof typeof themes] || themes.cozy;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-cream-primary rounded-xl shadow-lg overflow-hidden cursor-pointer group border border-cream-tertiary hover:border-orange-accent/30 transition-all"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={themeImage}
          alt={cafe.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-coffee-dark/60 to-transparent" />
        <div className="absolute bottom-4 left-4 text-text-inverse">
          <h3 className="text-xl font-bold mb-1">{cafe.name}</h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{cafe.current_members || 0}/{cafe.capacity}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-yellow-400" />
              <span>4.8</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <p className="text-text-secondary text-sm mb-4 line-clamp-2">
          {cafe.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 text-sm text-text-muted">
            <Clock className="h-4 w-4" />
            <span>Active now</span>
          </div>
          <div className="text-xs text-text-muted capitalize">
            {cafe.theme} theme
          </div>
        </div>
        
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse py-3 px-4 rounded-lg font-medium hover:from-orange-accent/90 hover:to-golden-accent/90 transition-all flex items-center justify-center space-x-2 shadow-lg"
        >
          <span>Join Café</span>
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default CafeCard;