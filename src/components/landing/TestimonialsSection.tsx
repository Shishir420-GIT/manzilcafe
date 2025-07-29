import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Product Designer",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b742?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100&q=80",
    quote: "The AI bartender is incredible! It feels like having real conversations with someone who understands the café atmosphere perfectly. I've made genuine connections here.",
  },
  {
    name: "Marcus Rodriguez",
    role: "Software Engineer",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100&q=80",
    quote: "As a remote worker, ManzilCafe has been a game-changer. The Tech Hub is perfect for networking, and the voice messaging makes conversations feel so natural.",
  },
  {
    name: "Emma Thompson",
    role: "Digital Nomad",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100&q=80",
    quote: "The security features give me peace of mind, and the themed environments are beautifully designed. It's like traveling to different cafés around the world from my laptop!",
  },
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-12"></div>
        <div className="absolute top-24 right-12 w-6 h-10 bg-orange-300/15 rounded-full transform rotate-30"></div>
        <div className="absolute bottom-16 left-12 w-10 h-16 bg-amber-300/15 rounded-full transform -rotate-20"></div>
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
            What Our Community Says
          </h2>
          <p className="text-xl text-amber-800/80 max-w-3xl mx-auto">
            Join thousands of users who have transformed their virtual social experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full bg-white/95 backdrop-blur-sm shadow-md hover:shadow-lg transition-all duration-300 border border-amber-200/30 rounded-2xl">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image}
                      alt={`Portrait of ${testimonial.name}`}
                      className="w-16 h-16 rounded-full object-cover mr-4" 
                    />
                    <div>
                      <h4 className="font-semibold text-amber-900">{testimonial.name}</h4>
                      <p className="text-sm text-amber-800/70">{testimonial.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-golden-accent text-golden-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-coffee-dark/80 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
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
