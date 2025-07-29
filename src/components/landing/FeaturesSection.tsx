import { motion } from "framer-motion";
import { Bot, MessageCircle, Mic, ShoppingCart, Building, Shield, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Bot,
    title: "AI Bartender",
    description: "Powered by Google Gemini, our AI bartender provides intelligent conversations, menu recommendations, and enhances café ambiance with contextual responses.",
    gradient: "from-orange-accent to-golden-accent",
  },
  {
    icon: MessageCircle,
    title: "Real-time Chat",
    description: "Connect instantly with live message synchronization, typing indicators, and seamless communication across all virtual café spaces.",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Mic,
    title: "Voice Messaging",
    description: "Express yourself naturally with real-time audio recording and playback, bringing authentic human connection to virtual spaces.",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: ShoppingCart,
    title: "Virtual Ordering",
    description: "Order from virtual menus with real-time tracking, notifications, and seamless integration with your café experience.",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Building,
    title: "Custom Café Spaces",
    description: "Create and customize your own themed café environments with unique atmospheres, capacity settings, and personalized experiences.",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Multi-layer AI security, prompt injection protection, rate limiting, and comprehensive monitoring for a safe virtual environment.",
    gradient: "from-red-500 to-orange-600",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 relative">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-10"></div>
        <div className="absolute top-20 left-10 w-12 h-20 bg-amber-200/20 rounded-full transform rotate-45"></div>
        <div className="absolute bottom-20 right-16 w-8 h-14 bg-orange-200/20 rounded-full transform -rotate-12"></div>
        <div className="absolute top-40 right-1/4 w-6 h-10 bg-yellow-200/20 rounded-full transform rotate-30"></div>
      </div>
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold text-amber-900 mb-6">
            Revolutionary Features
          </h2>
          <p className="text-xl text-amber-800/80 max-w-3xl mx-auto">
            Experience cutting-edge technology that brings people together in ways never imagined before
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -8 }}
              className="group"
            >
              <Card className="h-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-500 border border-amber-200/30 rounded-2xl">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <motion.div 
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300`}
                      whileHover={{ scale: 1.1 }}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-display font-semibold text-coffee-darker mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-coffee-dark/80 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="flex items-center text-orange-accent font-medium group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
