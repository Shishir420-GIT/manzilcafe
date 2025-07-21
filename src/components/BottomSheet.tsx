import { useEffect, useState } from 'react';
import { X, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxHeight?: string;
}

const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxHeight = '70vh' 
}: BottomSheetProps) => {
  const [isDragging, setIsDragging] = useState(false);

  // Prevent body scroll when bottom sheet is open
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

  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    
    // If dragged down significantly, close the sheet
    if (info.offset.y > 150) {
      onClose();
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            dragElastic={0.2}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 bg-warm-white rounded-t-2xl shadow-2xl z-50 lg:hidden"
            style={{ maxHeight }}
          >
            {/* Handle Bar */}
            <div className="flex flex-col items-center pt-3 pb-2 border-b border-cream-tertiary">
              <div className="w-10 h-1 bg-text-muted/30 rounded-full mb-3 cursor-grab active:cursor-grabbing" />
              
              {/* Header */}
              <div className="flex items-center justify-between w-full px-6 pb-2">
                <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
                <div className="flex items-center space-x-2">
                  {!isDragging && (
                    <div className="text-text-muted">
                      <ChevronDown className="h-5 w-5" />
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 text-text-muted hover:text-text-primary rounded-lg hover:bg-cream-secondary transition-colors"
                    style={{ minHeight: '44px', minWidth: '44px' }}
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-6 py-4" style={{ maxHeight: 'calc(70vh - 120px)' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BottomSheet;