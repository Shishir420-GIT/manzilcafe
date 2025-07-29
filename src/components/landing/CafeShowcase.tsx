import { motion } from "framer-motion";
import { Users, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const cafes = [
  {
    name: "Cozy Book Café",
    description: "A warm, intimate space perfect for deep conversations over literature and coffee. Vintage books line the walls creating an intellectual atmosphere.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    onlineCount: 12,
    tags: ["Quiet", "Study-friendly"],
    tagColors: ["bg-amber-100 text-coffee-dark", "bg-blue-100 text-blue-800"],
  },
  {
    name: "Tech Hub Central",
    description: "A vibrant, high-energy space designed for entrepreneurs, developers, and innovators. Perfect for networking and collaboration.",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    onlineCount: 28,
    tags: ["Networking", "Collaboration"],
    tagColors: ["bg-purple-100 text-purple-800", "bg-green-100 text-green-800"],
  },
];

export default function CafeShowcase() {
  return (
    <section id="cafes" className="py-20 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative">
      {/* Coffee-themed Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="coffee-texture absolute inset-0 opacity-15"></div>
        <div className="absolute top-32 right-20 w-10 h-16 bg-amber-300/15 rounded-full transform rotate-12"></div>
        <div className="absolute bottom-32 left-20 w-6 h-12 bg-orange-300/15 rounded-full transform -rotate-30"></div>
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
            Explore Virtual Café Environments
          </h2>
          <p className="text-xl text-amber-800/80 max-w-3xl mx-auto">
            Step into beautifully crafted virtual spaces, each with unique themes and atmospheres
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {cafes.map((cafe, index) => (
            <motion.div
              key={cafe.name}
              initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -4 }}
            >
              <Card className="overflow-hidden shadow-md hover:shadow-lg transition-all duration-500 bg-white/95 backdrop-blur-sm group rounded-2xl border border-amber-200/30">
                <div className="relative overflow-hidden">
                  <img 
                    src={cafe.image}
                    alt={cafe.name}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 right-4 flex items-center bg-green-500/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    {cafe.onlineCount} Online
                  </div>
                </div>
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-display font-semibold text-coffee-darker">
                      {cafe.name}
                    </h3>
                  </div>
                  <p className="text-coffee-dark/80 mb-6 leading-relaxed">
                    {cafe.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {cafe.tags.map((tag, tagIndex) => (
                        <Badge 
                          key={tag}
                          className={`${cafe.tagColors[tagIndex]} text-sm`}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button className="bg-orange-accent text-white font-semibold hover:bg-orange-accent/90 hover:shadow-lg transition-all duration-300 rounded-xl">
                      Join Café
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Browse More Cafés Button */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Button 
            variant="outline"
            size="lg"
            className="px-8 py-4 bg-white text-coffee-darker font-semibold text-lg border border-coffee-medium/20 hover:bg-coffee-light hover:shadow-lg transition-all duration-300 rounded-2xl"
          >
            <Compass className="mr-2 h-5 w-5" />
            Browse All 100+ Cafés
          </Button>
        </motion.div>
      </div>
      </div>
    </section>
  );
}
