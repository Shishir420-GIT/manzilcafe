import { useState, useEffect } from 'react';
import { Edit3, X, Coffee } from 'lucide-react';
import { User as UserType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileCompletionReminderProps {
  user: UserType;
  onCompleteProfile: () => void;
  onDismiss: () => void;
}

const ProfileCompletionReminder = ({ user, onCompleteProfile, onDismiss }: ProfileCompletionReminderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if reminder should be shown
    const shouldShow = () => {
      // Don't show if profile is already completed
      const isProfileCompleted = user.user_profiles?.profile_completed ?? false;
      if (isProfileCompleted) return false;

      // Check if reminder was dismissed this session
      const dismissedThisSession = sessionStorage.getItem(`profile-reminder-dismissed-${user.id}`);
      if (dismissedThisSession) return false;

      return true;
    };

    // Delay showing the reminder by 2 seconds for better UX
    const timer = setTimeout(() => {
      if (shouldShow()) {
        setIsVisible(true);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [user.id, user.profile_completed]);

  const handleDismiss = () => {
    // Store dismissal in session storage
    sessionStorage.setItem(`profile-reminder-dismissed-${user.id}`, 'true');
    setIsVisible(false);
    onDismiss();
  };

  const handleCompleteProfile = () => {
    setIsVisible(false);
    onCompleteProfile();
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-16 sm:top-20 left-4 right-4 sm:left-1/2 sm:transform sm:-translate-x-1/2 z-40 w-auto sm:w-full sm:max-w-md mx-auto"
      >
        <div className="bg-gradient-to-r from-golden-accent to-orange-accent rounded-xl sm:rounded-2xl shadow-2xl border border-golden-accent/30 overflow-hidden">
          <div className="p-4 sm:p-6">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-white/20 rounded-lg flex-shrink-0">
                <Coffee className="h-5 w-5 text-text-inverse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-text-inverse mb-1">
                  Welcome to Manziil Café, {user.name}! ☕
                </h3>
                <p className="text-text-inverse/90 text-sm mb-4 leading-relaxed">
                  Help fellow café visitors get to know you better by completing your profile. 
                  Add a bio, set your timezone, and make your café experience more personal.
                </p>
                
                {/* Mobile-optimized button layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2 sm:gap-0">
                  <button
                    onClick={handleCompleteProfile}
                    className="flex items-center justify-center space-x-2 bg-white/20 hover:bg-white/30 text-text-inverse px-4 py-3 rounded-lg font-medium transition-colors backdrop-blur-sm"
                    style={{ minHeight: '48px' }}
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Complete Profile</span>
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="text-text-inverse/80 hover:text-text-inverse px-4 py-3 rounded-lg font-medium transition-colors text-center"
                    style={{ minHeight: '48px' }}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors flex-shrink-0"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label="Dismiss reminder"
              >
                <X className="h-4 w-4 text-text-inverse" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProfileCompletionReminder;