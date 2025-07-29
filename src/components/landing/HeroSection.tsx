import { motion } from "framer-motion";
import { Play, Video, Coffee, MessageCircle, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  onAuthClick: () => void;
}

export default function HeroSection({ onAuthClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1521017432531-fbd92d768814?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080" 
          alt="Modern café interior" 
          className="w-full h-full object-cover" 
        />
        {/* Beige/Coffee Themed Overlay
        <div className="absolute inset-0 bg-gradient-to-br from-coffee-dark/85 via-coffee-darker/75 to-orange-accent/70"></div>
        <div className="absolute inset-0 bg-cream-bg/20"></div> */}
      </div>

      {/* Floating Coffee Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-20 left-10 w-3 h-3 bg-orange-accent/30 rounded-full animate-steam"
          animate={{ y: [-40, -80, -120] }}
          transition={{ duration: 4, repeat: Infinity, delay: 0 }}
        />
        <motion.div 
          className="absolute top-32 left-16 w-2 h-2 bg-orange-accent/20 rounded-full animate-steam"
          animate={{ y: [-40, -80, -120] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
        <motion.div 
          className="absolute top-24 left-20 w-2 h-2 bg-orange-accent/25 rounded-full animate-steam"
          animate={{ y: [-40, -80, -120] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
        />
        
        <motion.div 
          className="absolute top-40 right-20 w-3 h-3 bg-golden-accent/20 rounded-full animate-steam"
          animate={{ y: [-40, -80, -120] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1.5 }}
        />
        <motion.div 
          className="absolute top-48 right-24 w-2 h-2 bg-golden-accent/15 rounded-full animate-steam"
          animate={{ y: [-40, -80, -120] }}
          transition={{ duration: 5, repeat: Infinity, delay: 2.5 }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          {/* Coffee Icon */}
          <motion.div 
            className="w-20 h-20 bg-orange-accent rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-lg"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Coffee className="h-10 w-10 text-white" />
          </motion.div>
          
          <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-8 mb-8 border border-white/10">
            <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Welcome to <span className="text-orange-accent">Manziil Café</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/95 mb-0 max-w-4xl mx-auto leading-relaxed">
              Create or join virtual spaces, chat with friends, order virtual treats, and get recommendations from our AI bartender. Your cozy corner in the digital world.
            </p>
          </div>
          
          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                icon: Coffee,
                title: "Virtual Spaces",
                description: "Create themed spaces and invite friends for cozy conversations",
                gradient: "from-orange-400 via-amber-400 to-yellow-400",
                iconBg: "from-orange-500 to-amber-500"
              },
              {
                icon: MessageCircle,
                title: "Real-time Chat", 
                description: "Engage in live conversations with fellow space visitors",
                gradient: "from-blue-400 via-purple-400 to-pink-400",
                iconBg: "from-orange-500 to-amber-500"
              },
              {
                icon: Bot,
                title: "AI Bartender",
                description: "Get personalized recommendations and assistance from our AI helper",
                gradient: "from-green-400 via-teal-400 to-cyan-400",
                iconBg: "from-orange-500 to-amber-500"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3 + index * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group relative overflow-hidden"
              >
                {/* Animated Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 rounded-2xl transition-opacity duration-500 group-hover:opacity-30`}></div>
                
                {/* Card Content */}
                <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-coffee-medium/10 group-hover:border-orange-accent/20 overflow-hidden">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-4 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                  
                  {/* Floating Icon with Gradient */}
                  <motion.div 
                    className={`w-16 h-16 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 animate-pulse-glow`}
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6 }
                    }}
                    animate={{ 
                      y: [0, -4, 0],
                      transition: { 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.5
                      }
                    }}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </motion.div>
                  
                  {/* Animated Title */}
                  <motion.h3 
                    className="text-xl font-semibold text-coffee-darker mb-3 group-hover:text-orange-accent transition-colors duration-300"
                    whileHover={{ scale: 1.05 }}
                  >
                    {feature.title}
                  </motion.h3>
                  
                  {/* Description with subtle animation */}
                  <motion.p 
                    className="text-sm text-coffee-dark/90 leading-relaxed group-hover:text-coffee-darker transition-colors duration-300"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                  >
                    {feature.description}
                  </motion.p>
                  
                  {/* Decorative Elements */}
                  <motion.div 
                    className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-br from-orange-accent/20 to-golden-accent/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0.8, 0.5],
                      transition: { 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.3
                      }
                    }}
                  ></motion.div>
                  <motion.div 
                    className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-br from-coffee-medium/10 to-orange-accent/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ 
                      rotate: [0, 180, 360],
                      transition: { 
                        duration: 4,
                        repeat: Infinity,
                        delay: index * 0.2
                      }
                    }}
                  ></motion.div>
                  
                  {/* Floating Particles */}
                  <motion.div 
                    className="absolute top-8 left-8 w-2 h-2 bg-orange-accent/30 rounded-full"
                    animate={{ 
                      y: [0, -10, 0],
                      x: [0, 5, 0],
                      opacity: [0.3, 0.7, 0.3],
                      transition: { 
                        duration: 2.5,
                        repeat: Infinity,
                        delay: index * 0.4
                      }
                    }}
                  ></motion.div>
                  <motion.div 
                    className="absolute bottom-8 right-8 w-3 h-3 bg-golden-accent/25 rounded-full"
                    animate={{ 
                      y: [0, -8, 0],
                      x: [0, -3, 0],
                      scale: [1, 1.3, 1],
                      transition: { 
                        duration: 3,
                        repeat: Infinity,
                        delay: index * 0.6
                      }
                    }}
                  ></motion.div>
                </div>
                
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-accent/0 via-orange-accent/20 to-orange-accent/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>
              </motion.div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Button 
              size="lg"
              className="px-12 py-4 bg-orange-accent text-white font-semibold text-lg hover:bg-orange-accent/90 hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-2xl"
              onClick={onAuthClick}
            >
              Start Your VirtualCafe Journey
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-lg border-2 border-white/30 hover:bg-white/20 transition-all duration-300 rounded-2xl"
            >
              <Video className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </motion.div>
          
          {/* Auth Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8"
          >
            <Button 
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              onClick={onAuthClick}
            >
              Already have an account? Sign In
            </Button>
            <div className="text-white/60">|</div>
            <Button 
              variant="ghost"
              className="text-white/80 hover:text-white hover:bg-white/10 font-medium"
              onClick={onAuthClick}
            >
              New here? Sign Up Free
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
