import { motion } from "framer-motion";
import { MessageCircle, Check, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AIBartenderDemo() {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-10"></div>
        <div className="absolute top-16 left-16 w-8 h-14 bg-yellow-200/20 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-24 right-24 w-12 h-18 bg-amber-300/15 rounded-full transform -rotate-15"></div>
      </div>
      <div className="relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-amber-900 mb-6">
              Meet Your AI Bartender
            </h2>
            <p className="text-xl text-amber-800/80 mb-8 leading-relaxed">
              Powered by Google Gemini, our AI bartender provides intelligent conversations, personalized recommendations, and creates the perfect ambiance for every virtual café experience.
            </p>
            
            <div className="space-y-4 mb-8">
              {[
                {
                  title: "Contextual Conversations",
                  description: "Understands café themes and provides relevant, engaging dialogue"
                },
                {
                  title: "Smart Recommendations",
                  description: "Suggests menu items and activities based on your preferences"
                },
                {
                  title: "24/7 Availability",
                  description: "Always ready to chat, serve, and enhance your virtual experience"
                }
              ].map((feature, index) => (
                <motion.div 
                  key={feature.title}
                  className="flex items-start space-x-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-amber-900">{feature.title}</h4>
                    <p className="text-amber-800/80">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="px-8 py-4 bg-orange-accent text-white font-semibold text-lg hover:bg-orange-accent/90 hover:shadow-lg transition-all duration-300 rounded-2xl"
              >
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat with Bartender
              </Button>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <img 
              src="https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600"
              alt="Modern AI chatbot interface on a sleek tablet"
              className="w-full h-auto rounded-2xl shadow-2xl" 
            />
            
            {/* Floating Chat Bubbles */}
            <motion.div 
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-sm border border-coffee-medium/10"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-accent to-golden-accent rounded-full flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-coffee-darker">AI Bartender</span>
              </div>
              <p className="text-sm text-coffee-dark/80">
                "Welcome to the Cozy Book Café! I recommend trying our signature Literary Latte - perfect for deep conversations!"
              </p>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-4 left-4 bg-blue-500/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs"
              animate={{ y: [5, -5, 5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: -1 }}
            >
              <p className="text-sm text-white">
                "@bartender What's the most popular drink here?"
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
      </div>
    </section>
  );
}
