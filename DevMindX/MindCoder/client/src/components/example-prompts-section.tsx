import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, MessageSquare, Calendar, FileText, 
  Gamepad2, Music, Camera, Utensils, Plane, Heart,
  Sparkles, ArrowRight, Code, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ExamplePromptsSection() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedExample, setSelectedExample] = useState<number | null>(null);

  const examples = [
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: 'E-Commerce Store',
      description: 'Online shopping platform with cart and checkout',
      prompt: 'Create a modern e-commerce website with product listings, shopping cart, user authentication, payment integration using Stripe, order management, and a responsive design. Include product search, filters, and a clean admin dashboard.',
      gradient: 'from-purple-500 to-pink-500',
      tags: ['React', 'Node.js', 'MongoDB', 'Stripe']
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: 'Social Media App',
      description: 'Connect and share with friends',
      prompt: 'Build a social media application with user profiles, post creation with images, real-time chat, likes and comments, friend requests, notifications, and a news feed algorithm.',
      gradient: 'from-blue-500 to-cyan-500',
      tags: ['React', 'Socket.io', 'PostgreSQL', 'Redis']
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: 'Task Manager',
      description: 'Organize tasks and boost productivity',
      prompt: 'Create a task management app with kanban boards, drag-and-drop functionality, task priorities, due dates, team collaboration, time tracking, and progress reports.',
      gradient: 'from-green-500 to-emerald-500',
      tags: ['Vue.js', 'Firebase', 'Tailwind']
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Blog Platform',
      description: 'Share your thoughts with the world',
      prompt: 'Build a blogging platform with markdown editor, syntax highlighting for code, categories and tags, comments system, SEO optimization, and social media sharing.',
      gradient: 'from-orange-500 to-red-500',
      tags: ['Next.js', 'MDX', 'Prisma']
    },
    {
      icon: <Gamepad2 className="w-6 h-6" />,
      title: 'Gaming Portal',
      description: 'Interactive games and leaderboards',
      prompt: 'Create a gaming portal with multiple HTML5 games, user profiles, leaderboards, achievements, multiplayer support, and real-time score updates.',
      gradient: 'from-indigo-500 to-purple-500',
      tags: ['Phaser.js', 'WebSocket', 'Express']
    },
    {
      icon: <Music className="w-6 h-6" />,
      title: 'Music Streaming',
      description: 'Stream and discover music',
      prompt: 'Build a music streaming service with playlist creation, audio player controls, search functionality, artist profiles, recommendations, and offline mode.',
      gradient: 'from-pink-500 to-rose-500',
      tags: ['React', 'Web Audio API', 'AWS S3']
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: 'Photo Gallery',
      description: 'Showcase your photography',
      prompt: 'Create a photo gallery app with image upload, albums, filters and editing tools, social sharing, comments, and a beautiful masonry layout.',
      gradient: 'from-cyan-500 to-blue-500',
      tags: ['React', 'Cloudinary', 'Canvas API']
    },
    {
      icon: <Utensils className="w-6 h-6" />,
      title: 'Recipe App',
      description: 'Discover and share recipes',
      prompt: 'Build a recipe sharing platform with ingredient lists, cooking instructions, nutritional information, meal planning, shopping lists, and user ratings.',
      gradient: 'from-yellow-500 to-orange-500',
      tags: ['Angular', 'MongoDB', 'Material UI']
    },
    {
      icon: <Plane className="w-6 h-6" />,
      title: 'Travel Planner',
      description: 'Plan your perfect trip',
      prompt: 'Create a travel planning app with itinerary builder, booking integration, budget tracking, destination guides, weather forecasts, and travel tips.',
      gradient: 'from-teal-500 to-green-500',
      tags: ['React', 'Google Maps API', 'Stripe']
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: 'Fitness Tracker',
      description: 'Track your health and fitness',
      prompt: 'Build a fitness tracking app with workout logging, progress charts, calorie counter, exercise library, goal setting, and social challenges.',
      gradient: 'from-red-500 to-pink-500',
      tags: ['React Native', 'Chart.js', 'Firebase']
    }
  ];

  const handleUsePrompt = (prompt: string, index: number) => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to use example prompts',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    setSelectedExample(index);
    // Navigate to generator with the prompt
    navigate(`/generator?prompt=${encodeURIComponent(prompt)}`);
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-transparent" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center px-4 py-2 glass-card rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-300 font-medium">Example Prompts</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get <span className="gradient-text">Inspired</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Try these example prompts to see what DevMindX can build for you
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {examples.map((example, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 hover-lift cursor-pointer group"
              onClick={() => handleUsePrompt(example.prompt, index)}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${example.gradient} flex items-center justify-center mb-4 text-white group-hover:scale-110 transition-transform`}>
                {example.icon}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {example.title}
              </h3>

              <p className="text-gray-400 text-sm mb-4">
                {example.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {example.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded text-xs text-purple-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <Button
                className={`w-full bg-gradient-to-r ${example.gradient} hover:opacity-90 text-white font-semibold text-sm`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleUsePrompt(example.prompt, index);
                }}
              >
                <Code className="w-4 h-4 mr-2" />
                Use This Prompt
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button
            onClick={() => navigate(isAuthenticated ? '/generator' : '/signup')}
            size="lg"
            className="btn-ai-primary px-8 py-6 text-lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Create Your Own Project
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
