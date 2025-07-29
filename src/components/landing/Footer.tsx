import { motion } from "framer-motion";
import { Coffee, Twitter, Github, MapPin, Phone, Mail, Users, Star, Heart } from "lucide-react";
import { FaDiscord } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 text-white py-20 overflow-hidden">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-20"></div>
        
        {/* Floating Coffee Beans */}
        <motion.div 
          className="absolute top-10 left-10 w-6 h-10 bg-orange-500/20 rounded-full transform rotate-45"
          animate={{ 
            rotate: [45, 60, 45],
            scale: [1, 1.1, 1],
            transition: { duration: 4, repeat: Infinity }
          }}
        />
        <motion.div 
          className="absolute top-20 right-20 w-8 h-12 bg-yellow-500/20 rounded-full transform -rotate-12"
          animate={{ 
            rotate: [-12, 3, -12],
            y: [0, -5, 0],
            transition: { duration: 5, repeat: Infinity, delay: 1 }
          }}
        />
        <motion.div 
          className="absolute bottom-20 left-1/4 w-5 h-8 bg-amber-600/25 rounded-full transform rotate-30"
          animate={{ 
            rotate: [30, 45, 30],
            opacity: [0.15, 0.25, 0.15],
            transition: { duration: 3, repeat: Infinity, delay: 2 }
          }}
        />
        
        {/* Steam Effects */}
        <div className="absolute top-16 right-1/3 flex space-x-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-8 bg-white/10 rounded-full"
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
                transition: {
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-1 md:col-span-2">
            <motion.div 
              className="flex items-center space-x-4 mb-8"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="p-3 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl shadow-lg"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  transition: { duration: 4, repeat: Infinity }
                }}
              >
                <Coffee className="h-8 w-8 text-white" />
              </motion.div>
              <div>
                <h3 className="text-3xl font-display font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  ManzilCafe 2.0
                </h3>
                <p className="text-orange-400/80 font-medium">Virtual Social Experience</p>
              </div>
            </motion.div>
            
            <p className="text-white/85 mb-8 max-w-lg leading-relaxed text-lg">
              Where virtual connections become real experiences. Join our community of innovators, creators, and social explorers in beautifully crafted virtual environments.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: Users, count: "10K+", label: "Active Users" },
                { icon: Coffee, count: "50+", label: "Virtual Cafés" },
                { icon: Star, count: "4.9", label: "Rating" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="text-center p-4 bg-white/5 hover:bg-white/10 rounded-xl backdrop-blur-sm transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <stat.icon className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-xl font-bold text-white">{stat.count}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </motion.div>
              ))}
            </div>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {[
                { icon: Twitter, href: "https://x.com/shishir_who", label: "Twitter" },
                { icon: FaDiscord, href: "#", label: "Discord" },
                { icon: Github, href: "https://github.com/Shishir420-GIT", label: "GitHub" },
              ].map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-gradient-to-br from-white/10 to-white/5 rounded-xl flex items-center justify-center hover:from-orange-500/20 hover:to-yellow-500/20 transition-all duration-300 border border-white/10"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.label}
                >
                  <social.icon className="h-6 w-6 text-white group-hover:text-orange-400 transition-colors" />
                </motion.a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-8 text-orange-400">Product</h4>
            <ul className="space-y-4">
              {[
                { name: 'Virtual Spaces', desc: 'Create your café' },
                { name: 'AI Bartender', desc: 'Smart recommendations' },
                { name: 'Real-time Chat', desc: 'Connect instantly' },
                { name: 'Voice Messages', desc: 'Speak naturally' }
              ].map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="group block">
                    <div className="text-white/90 group-hover:text-white font-medium transition-colors">
                      {item.name}
                    </div>
                    <div className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                      {item.desc}
                    </div>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xl font-semibold mb-8 text-orange-400">Company</h4>
            <ul className="space-y-4">
              {[
                { name: 'About Us', desc: 'Our story & mission' },
                { name: 'Careers', desc: 'Join our team' },
                { name: 'Blog', desc: 'Latest updates' },
                { name: 'Support', desc: '24/7 help center' }
              ].map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ x: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href="#" className="group block">
                    <div className="text-white/90 group-hover:text-white font-medium transition-colors">
                      {item.name}
                    </div>
                    <div className="text-white/60 text-sm group-hover:text-white/80 transition-colors">
                      {item.desc}
                    </div>
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <motion.div 
          className="bg-gradient-to-r from-orange-500/15 to-yellow-500/15 rounded-2xl p-8 mb-12 border border-orange-400/30"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className="text-center mb-6">
            <h4 className="text-2xl font-bold text-white mb-2">Stay in the Loop</h4>
            <p className="text-white/80">Get updates on new features, virtual events, and community highlights</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email..."
              className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-orange-400/50 focus:bg-white/15 transition-all"
            />
            <motion.button 
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl hover:scale-105 transition-all duration-300 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Subscribe
            </motion.button>
          </div>
        </motion.div>

        {/* Bottom Footer */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <motion.div 
            className="flex items-center space-x-2 mb-4 md:mb-0"
            whileHover={{ scale: 1.02 }}
          >
            <Heart className="h-4 w-4 text-orange-400" />
            <p className="text-white/70 text-sm">
              © {currentYear} ManzilCafe. Made with love for virtual communities.
            </p>
          </motion.div>
          
          <div className="flex space-x-8">
            {[
              { name: 'Privacy Policy', href: '#' },
              { name: 'Terms of Service', href: '#' },
              { name: 'Cookie Policy', href: '#' }
            ].map((item) => (
              <motion.a 
                key={item.name}
                href={item.href} 
                className="text-white/60 hover:text-orange-400 text-sm transition-colors font-medium"
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
