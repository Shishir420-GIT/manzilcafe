import { useState, useEffect } from 'react';
import { X, Home, Coffee, Clock, Bot, User, LogOut, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User as UserType } from '../types';

interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  currentView: 'home' | 'browse';
  onHomeClick: () => void;
  onBrowseClick: () => void;
  onFocusRoomClick: () => void;
  onBartenderClick: () => void;
  onProfileClick: () => void;
  onInfoClick: () => void;
  onSignOut: () => void;
}

const MobileNavDrawer = ({
  isOpen,
  onClose,
  user,
  currentView,
  onHomeClick,
  onBrowseClick,
  onFocusRoomClick,
  onBartenderClick,
  onProfileClick,
  onInfoClick,
  onSignOut,
}: MobileNavDrawerProps) => {
  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const menuItems = [
    {
      icon: Home,
      label: 'Home',
      onClick: () => {
        onHomeClick();
        onClose();
      },
      active: currentView === 'home',
    },
    {
      icon: Coffee,
      label: 'Browse Cafés',
      onClick: () => {
        onBrowseClick();
        onClose();
      },
      active: currentView === 'browse',
    },
    {
      icon: Clock,
      label: 'Focus Room',
      onClick: () => {
        onFocusRoomClick();
        onClose();
      },
      active: false,
    },
    {
      icon: Bot,
      label: 'AI Bartender',
      onClick: () => {
        onBartenderClick();
        onClose();
      },
      active: false,
    },
    {
      icon: User,
      label: 'Profile',
      onClick: () => {
        onProfileClick();
        onClose();
      },
      active: false,
    },
    {
      icon: Info,
      label: 'About',
      onClick: () => {
        onInfoClick();
        onClose();
      },
      active: false,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 left-0 h-full w-80 bg-warm-white shadow-2xl z-50 md:hidden overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cream-tertiary">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center overflow-hidden">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to initials if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-text-inverse font-semibold">${user.name.charAt(0).toUpperCase()}</span>`;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-text-inverse font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{user.name}</h3>
                  <p className="text-sm text-text-secondary capitalize">{user.role}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-cream-secondary transition-colors"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Items */}
            <div className="p-4">
              <nav className="space-y-2">
                {menuItems.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                        item.active
                          ? 'bg-gradient-to-r from-orange-accent to-golden-accent text-text-inverse shadow-lg'
                          : 'text-text-secondary hover:text-text-primary hover:bg-cream-secondary'
                      }`}
                      style={{ minHeight: '48px' }} // Touch target optimization
                    >
                      <IconComponent className="h-5 w-5 flex-shrink-0" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-cream-tertiary bg-warm-white">
              <button
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 text-error hover:bg-red-50 rounded-xl transition-colors"
                style={{ minHeight: '48px' }} // Touch target optimization
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileNavDrawer;