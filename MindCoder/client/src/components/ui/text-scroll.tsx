"use client";

import React from "react";
import { motion } from "framer-motion";

interface TextScrollProps {
  text: string;
  className?: string;
  default_velocity?: number;
}

export function TextScroll({ text, className = "", default_velocity = 5 }: TextScrollProps) {
  // Velocity controls the speed of the scroll
  const velocity = default_velocity;

  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`}> 
      <motion.div
        animate={{ x: [0, -100] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 20 / velocity,
          ease: "linear",
        }}
        className="inline-block"
      >
        {text}
      </motion.div>
      <motion.div
        aria-hidden="true"
        animate={{ x: [0, -100] }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 20 / velocity,
          ease: "linear",
          delay: 10 / velocity,
        }}
        className="inline-block"
      >
        {text}
      </motion.div>
    </div>
  );
}