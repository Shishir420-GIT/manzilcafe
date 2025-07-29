import { motion } from "framer-motion";
import { Rocket, Github, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CTASectionProps {
  onAuthClick: () => void;
}

export default function CTASection({ onAuthClick }: CTASectionProps) {
  return (
    <section className="py-20 bg-gradient-to-br from-amber-800 to-amber-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        {[
          { size: 32, top: 10, left: 10 },
          { size: 24, top: 32, right: 20 },
          { size: 40, bottom: 20, left: '25%' },
          { size: 28, bottom: 10, right: 10 },
        ].map((circle, index) => (
          <motion.div
            key={index}
            className={`absolute w-${circle.size} h-${circle.size} border border-white/20 rounded-full`}
            style={{ 
              top: typeof circle.top === 'number' ? `${circle.top * 4}px` : undefined,
              bottom: typeof circle.bottom === 'number' ? `${circle.bottom * 4}px` : undefined,
              left: typeof circle.left === 'string' ? circle.left : typeof circle.left === 'number' ? `${circle.left * 4}px` : undefined,
              right: typeof circle.right === 'number' ? `${circle.right * 4}px` : undefined,
            }}
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.1, 0.2, 0.1] 
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              delay: index * 0.5 
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">
            Ready to Experience the Future?
          </h2>
          <p className="text-xl md:text-2xl mb-8 text-white/90 leading-relaxed">
            Join thousands of users already connecting in beautiful virtual café environments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                className="px-10 py-4 bg-orange-500 text-white font-bold text-xl hover:bg-orange-600 hover:shadow-lg transition-all duration-300 rounded-2xl"
                onClick={onAuthClick}
              >
                <Rocket className="mr-3 h-6 w-6" />
                Start Your Journey
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline"
                size="lg"
                className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold text-xl border-2 border-white/30 hover:bg-white/20 transition-all duration-300"
                onClick={() => window.open("https://github.com/Shishir420-GIT/manzilcafe", "_blank")}
              >
                <Github className="mr-3 h-6 w-6" />
                View on GitHub
              </Button>
            </motion.div>
          </div>

          <motion.div 
            className="flex flex-col sm:flex-row gap-8 justify-center items-center text-white/80"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {[
              "Free to start",
              "No credit card required", 
              "Join in seconds"
            ].map((feature, index) => (
              <div key={feature} className="flex items-center">
                <CheckCircle className="mr-2 h-5 w-5 text-green-400" />
                <span>{feature}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
