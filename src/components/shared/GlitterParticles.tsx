import React from 'react';
import { motion } from 'framer-motion';

const PARTICLE_COUNT = 20;

const GlitterParticles = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
      style={{ overflow: 'hidden' }}
    >
      {[...Array(PARTICLE_COUNT)].map((_, i) => {
        const size = Math.random() * 4 + 2;
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        // Increase minimum opacity by 20%
        const opacity = Math.random() * 0.5 + 0.44; // was 0.2, now 0.44
        const delay = Math.random() * 5;
        const duration = Math.random() * 8 + 6;
        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/95 blur-sm"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: `${left}%`,
              top: `${top}%`,
              opacity,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
            animate={{
              y: [0, 40, 0],
              opacity: [opacity, 1, opacity],
            }}
            transition={{
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
              duration,
              delay,
            }}
          />
        );
      })}
    </div>
  );
};

export default GlitterParticles; 