import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Coffee, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigationProps {
  onAuthClick: () => void;
}

export default function Navigation({ onAuthClick }: NavigationProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-coffee-dark/95 backdrop-blur-md' : 'bg-coffee-dark'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <div className="p-2 bg-orange-accent rounded-xl shadow-lg">
              <Coffee className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-display text-white">Manziil Café</h1>
              <p className="text-xs text-white/80 hidden sm:block">Your virtual social Café experience</p>
            </div>
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['features', 'cafes', 'testimonials', 'security'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-white/80 hover:text-orange-accent transition-colors font-medium capitalize"
              >
                {item === 'cafes' ? 'Cafés' : item}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              onClick={onAuthClick}
            >
              Sign In
            </Button>
            <Button 
              className="bg-orange-accent text-white font-semibold hover:bg-orange-accent/90 hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-xl px-6"
              onClick={onAuthClick}
            >
              Join Now
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-coffee-dark/95 backdrop-blur-md border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-2">
            {['features', 'cafes', 'testimonials', 'security'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="block w-full text-left py-2 text-white/80 hover:text-orange-accent transition-colors font-medium capitalize"
              >
                {item === 'cafes' ? 'Cafés' : item}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
