import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { 
  Code2, Sparkles, Users, Zap, Brain, Terminal, 
  BookOpen, Network, Layers, MessageSquare, FolderOpen,
  ArrowRight, CheckCircle, Play, Rocket, Database,
  FileCode, GitBranch, Search, Award, TrendingUp,
  Shield, Globe, Cpu, Cloud
} from 'lucide-react';

export default function HomeProfessional() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Brain,
      title: 'Research Engine',
      description: 'AI-powered research that analyzes your idea and generates the perfect project prompt',
      gradient: 'from-purple-500 to-pink-500',
      link: '/research',
      features: ['Deep idea analysis', 'Tech stack recommendations', 'Best practices', 'Ready-to-use prompts']
    },
    {
      icon: Layers,
      title: 'Architecture Generator',
      description: 'Auto-generate system blueprints, class diagrams, ER diagrams, and API documentation',
      gradient: 'from-blue-500 to-cyan-500',
      link: '/architecture',
      features: ['System architecture', 'Class & ER diagrams', 'Sequence diagrams', 'REST API blueprints']
    },
    {
      icon: MessageSquare,
      title: 'Learning Mode',
      description: 'Understand every line of code with AI-powered explanations, flow diagrams, and quizzes',
      gradient: 'from-orange-500 to-red-500',
      link: '/learning-mode',
      features: ['Line-by-line explanations', 'Flow diagrams', 'Quiz & Viva questions', 'Download materials']
    },
    {
      icon: Sparkles,
      title: 'Project Generator',
      description: 'Describe your idea and watch AI create a complete, running application in seconds',
      gradient: 'from-purple-600 to-pink-600',
      link: '/generator',
      features: ['Natural language input', 'Live preview', 'Production-ready code', 'Multiple frameworks']
    },
    {
      icon: Code2,
      title: 'Code Editor',
      description: 'Professional IDE with AI assistance, terminal, and real-time collaboration',
      gradient: 'from-indigo-500 to-purple-500',
      link: '/ide',
      features: ['Monaco editor', 'AI chat help', 'Integrated terminal', 'File management']
    },
    {
      icon: FolderOpen,
      title: 'Project Management',
      description: 'Organize, manage, and deploy your projects with one-click export and deployment',
      gradient: 'from-green-500 to-emerald-500',
      link: '/projects',
      features: ['Project dashboard', 'Version control', 'One-click export', 'Cloud deployment']
    }
  ];

  const stats = [
    { value: '10K+', label: 'Projects Created', icon: Rocket },
    { value: '5K+', label: 'Active Developers', icon: Users },
    { value: '50+', label: 'Languages Supported', icon: Code2 },
    { value: '99.9%', label: 'Uptime', icon: TrendingUp }
  ];

  const benefits = [
    { icon: Zap, title: 'Lightning Fast', description: 'Generate projects in seconds, not hours' },
    { icon: Shield, title: 'Production Ready', description: 'Clean, tested, and deployable code' },
    { icon: Globe, title: 'Multi-Framework', description: 'React, Vue, Angular, and more' },
    { icon: Cpu, title: 'AI-Powered', description: 'Latest AI models for best results' },
    { icon: Users, title: 'Collaborative', description: 'Work together in real-time' },
    { icon: Cloud, title: 'Cloud Native', description: 'Deploy anywhere instantly' }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Code2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DevMindX
              </span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href="/ide">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Go to IDE
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Development Platform
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                Build Faster with
                <span className="block bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mt-2">
                  AI-Powered Tools
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
                From idea to deployment in minutes. Research, design, code, learn, and collaborate
                <br className="hidden md:block" />
                all in one intelligent platform powered by cutting-edge AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href={isAuthenticated ? "/ide" : "/signup"}>
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 shadow-lg shadow-blue-500/30">
                    Start Building Free
                    <Rocket className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/generator">
                  <Button size="lg" variant="outline" className="text-gray-700 border-gray-300 text-lg px-8 py-6">
                    Try Demo
                    <Play className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-700">
              Complete Toolkit
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to Build
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Six powerful tools working together to transform your development workflow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-2 border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group">
                  <CardHeader>
                    <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <CardTitle className="text-xl text-gray-900">{feature.title}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-4">
                      {feature.features.map((item, i) => (
                        <li key={i} className="flex items-center text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <Link href={feature.link}>
                      <Button className="w-full bg-gray-900 hover:bg-gray-800 text-white">
                        Explore
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose DevMindX?
            </h2>
            <p className="text-xl text-gray-600">
              Built for modern developers who value speed and quality
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <benefit.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Development?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of developers building the future with AI
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-6 shadow-xl">
                Start Building Now - It's Free
                <Rocket className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/research">
              <Button size="lg" variant="outline" className="text-white border-2 border-white hover:bg-white/10 text-lg px-10 py-6">
                Explore Research Engine
                <Search className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Code2 className="h-6 w-6" />
                <span className="text-xl font-bold">DevMindX</span>
              </div>
              <p className="text-gray-400 text-sm">
                AI-powered development platform for modern developers
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link href="/generator"><a className="hover:text-white">Generator</a></Link></li>
                <li><Link href="/research"><a className="hover:text-white">Research</a></Link></li>
                <li><Link href="/architecture"><a className="hover:text-white">Architecture</a></Link></li>
                <li><Link href="/learning-mode"><a className="hover:text-white">Learning</a></Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">Documentation</a></li>
                <li><a href="#" className="hover:text-white">API Reference</a></li>
                <li><a href="#" className="hover:text-white">Tutorials</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 DevMindX. All rights reserved. Built with ❤️ for developers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
