import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

export default function FloatingAIButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling past hero section
      const scrollY = window.scrollY;
      setIsVisible(scrollY > 600);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToAIGenerator = () => {
    const aiGeneratorSection = document.getElementById('ai-generator');
    if (aiGeneratorSection) {
      aiGeneratorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative">
            {/* Expanded tooltip */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                  className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-800 border border-gray-700 rounded-lg p-4 shadow-xl min-w-[280px]"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-semibold">Try AI Generator</h3>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-gray-300 text-sm mb-3">
                    Describe your project idea and watch AI create a complete application in seconds!
                  </p>
                  <Button
                    onClick={scrollToAIGenerator}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Building
                  </Button>
                  
                  {/* Arrow pointing to main button */}
                  <div className="absolute right-[-8px] top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-8 border-l-gray-800 border-t-4 border-t-transparent border-b-4 border-b-transparent"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main floating button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onHoverStart={() => setIsExpanded(true)}
              onHoverEnd={() => setIsExpanded(false)}
            >
              <Button
                onClick={scrollToAIGenerator}
                className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all relative overflow-hidden"
              >
                {/* Animated background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 opacity-0"
                  animate={{ opacity: [0, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
              </Button>
            </motion.div>

            {/* Pulse effect */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}