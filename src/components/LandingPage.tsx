import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import CafeShowcase from "@/components/landing/CafeShowcase";
import AIBartenderDemo from "@/components/landing/AIBartenderDemo";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import SecuritySection from "@/components/landing/SecuritySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

interface LandingPageProps {
  onAuthClick: () => void;
}

export default function LandingPage({ onAuthClick }: LandingPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen overflow-x-hidden relative">
          {/* Scrolling Coffee Background */}
          <div className="fixed inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-gradient-to-br from-cream-bg via-warm-beige to-coffee-medium/5"></div>
            <div className="coffee-texture absolute inset-0 opacity-30"></div>
            
            {/* Floating Coffee Elements */}
            <div className="absolute top-20 left-10 w-4 h-4 bg-coffee-dark/10 rounded-full animate-bounce-gentle"></div>
            <div className="absolute top-40 right-20 w-6 h-6 bg-orange-accent/10 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-60 left-1/4 w-3 h-3 bg-golden-accent/15 rounded-full animate-bounce-gentle" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-80 right-1/3 w-5 h-5 bg-coffee-medium/10 rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
            <div className="absolute top-96 left-1/2 w-2 h-2 bg-orange-accent/20 rounded-full animate-bounce-gentle" style={{ animationDelay: '4s' }}></div>
            
            {/* Coffee Bean Patterns */}
            <div className="absolute top-32 right-10 w-8 h-12 bg-coffee-dark/5 rounded-full transform rotate-45 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute top-52 left-16 w-6 h-10 bg-coffee-medium/5 rounded-full transform -rotate-12 animate-pulse" style={{ animationDelay: '4s' }}></div>
            <div className="absolute top-72 right-1/4 w-10 h-14 bg-coffee-dark/5 rounded-full transform rotate-12 animate-pulse" style={{ animationDelay: '6s' }}></div>
          </div>
          
          <div className="relative z-10">
            <Navigation onAuthClick={onAuthClick} />
            <HeroSection onAuthClick={onAuthClick} />
            <FeaturesSection />
            <CafeShowcase />
            <AIBartenderDemo />
            <TestimonialsSection />
            <SecuritySection />
            <CTASection onAuthClick={onAuthClick} />
            <Footer />
          </div>
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}