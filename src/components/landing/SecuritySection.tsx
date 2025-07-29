import { motion } from "framer-motion";
import { Shield, UserCheck, Lock, TrendingUp } from "lucide-react";

const securityFeatures = [
  {
    icon: Shield,
    title: "AI Security",
    description: "Multi-layer protection against prompt injection and jailbreak attacks",
    gradient: "from-red-500 to-orange-600",
  },
  {
    icon: UserCheck,
    title: "Authentication",
    description: "Secure Google OAuth with JWT tokens and session management",
    gradient: "from-blue-500 to-purple-600",
  },
  {
    icon: Lock,
    title: "Data Protection",
    description: "Encrypted transmission with input validation and XSS protection",
    gradient: "from-green-500 to-teal-600",
  },
  {
    icon: TrendingUp,
    title: "Monitoring",
    description: "Real-time security logging and comprehensive error tracking",
    gradient: "from-yellow-500 to-orange-500",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="py-20 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-10"></div>
        <div className="absolute top-20 right-16 w-8 h-14 bg-amber-300/15 rounded-full transform rotate-25"></div>
        <div className="absolute bottom-20 left-16 w-12 h-18 bg-orange-300/15 rounded-full transform -rotate-35"></div>
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
            Enterprise-Grade Security
          </h2>
          <p className="text-xl text-amber-800/80 max-w-3xl mx-auto">
            Your safety and privacy are our top priorities with multi-layer protection and monitoring
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {securityFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <motion.div 
                className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <feature.icon className="h-8 w-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-semibold text-amber-900 mb-3">{feature.title}</h3>
              <p className="text-amber-800/80 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
