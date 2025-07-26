import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AuthModal } from "@/components/auth-modal";
import { UserProfile } from "@/components/user-profile";
import { Code, Brain, Zap, Users, CheckCircle, Star, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "Multiple AI Models",
      description: "Choose from ChatGPT, Claude, and Gemini for code generation and assistance"
    },
    {
      icon: <Code className="w-8 h-8 text-green-500" />,
      title: "Smart Code Generation",
      description: "Generate complete project structures from natural language descriptions"
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Real-time Collaboration",
      description: "Work with AI assistants that understand your project context"
    },
    {
      icon: <Users className="w-8 h-8 text-purple-500" />,
      title: "Multi-framework Support",
      description: "Support for React, Vue, Angular, Node.js, Python, and more"
    }
  ];

  const aiModels = [
    {
      name: "ChatGPT",
      provider: "OpenAI",
      description: "GPT-4o for advanced code generation and problem solving",
      capabilities: ["Code Generation", "Debugging", "Refactoring", "Documentation"],
      badge: "Most Popular"
    },
    {
      name: "Claude",
      provider: "Anthropic",
      description: "Claude Sonnet for reliable and thoughtful code assistance",
      capabilities: ["Code Review", "Architecture Design", "Testing", "Optimization"],
      badge: "Best for Complex Logic"
    },
    {
      name: "Gemini",
      provider: "Google",
      description: "Gemini Pro for multimodal development assistance",
      capabilities: ["Code Generation", "Image Analysis", "Multi-language", "Integration"],
      badge: "Multimodal"
    }
  ];

  const useCases = [
    {
      title: "Hospital Management System",
      description: "Complete healthcare solution with patient records, appointments, and billing",
      tags: ["React", "Node.js", "PostgreSQL", "Healthcare"]
    },
    {
      title: "E-commerce Platform",
      description: "Full-featured online store with cart, payments, and inventory management",
      tags: ["Next.js", "Stripe", "MongoDB", "E-commerce"]
    },
    {
      title: "Social Media App",
      description: "Modern social platform with posts, messaging, and real-time features",
      tags: ["React Native", "Socket.io", "Redis", "Social"]
    },
    {
      title: "Dashboard Analytics",
      description: "Data visualization platform with charts, reports, and insights",
      tags: ["Vue.js", "D3.js", "Python", "Analytics"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Code className="w-8 h-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">DevMindX</span>
              <Badge variant="secondary" className="bg-blue-600 text-white">AI-Powered</Badge>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#ai-models" className="text-gray-300 hover:text-white transition-colors">AI Models</a>
              <a href="#examples" className="text-gray-300 hover:text-white transition-colors">Examples</a>
              <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            </nav>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex space-x-2">
                    <Button onClick={() => navigate('/ide')} className="bg-blue-600 hover:bg-blue-700">
                      Go to IDE
                    </Button>
                    <Button onClick={() => navigate('/cursor-ide')} className="bg-purple-600 hover:bg-purple-700">
                      Cursor IDE
                    </Button>
                  </div>
                  <UserProfile />
                </>
              ) : (
                <Button onClick={() => setShowAuthModal(true)} className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="outline" className="border-blue-400 text-blue-400 mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation IDE
            </Badge>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Build Anything with
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {" "}AI Power
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your ideas into complete applications using natural language. 
            Our AI IDE supports multiple LLM models and generates production-ready code instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={isAuthenticated ? () => navigate('/ide') : () => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-4"
              >
                {isAuthenticated ? "Launch AI IDE" : "Launch AI IDE"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button
                size="lg"
                onClick={isAuthenticated ? () => navigate('/cursor-ide') : () => setShowAuthModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-lg px-8 py-4"
              >
                {isAuthenticated ? "Try Cursor IDE" : "Try Cursor IDE"}
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </div>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:text-white text-lg px-8 py-4"
            >
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Everything you need to build modern applications with AI assistance
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader>
                  <div className="mb-4">{feature.icon}</div>
                  <CardTitle className="text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-300">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Models Section */}
      <section id="ai-models" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Choose Your AI Assistant</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Select from the world's most advanced language models for your development needs
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {aiModels.map((model, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <CardTitle className="text-white text-xl">{model.name}</CardTitle>
                      <p className="text-gray-400">{model.provider}</p>
                    </div>
                    <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                      {model.badge}
                    </Badge>
                  </div>
                  <CardDescription className="text-gray-300">{model.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-white">Capabilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="examples" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Build Anything You Imagine</h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From simple websites to complex enterprise applications
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors">
                <CardHeader>
                  <CardTitle className="text-white">{useCase.title}</CardTitle>
                  <CardDescription className="text-gray-300">{useCase.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {useCase.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Build the Future?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already building with AI-powered tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={isAuthenticated ? () => navigate('/ide') : () => setShowAuthModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-4"
            >
              {isAuthenticated ? "Go to Your IDE" : "Start Building Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              onClick={isAuthenticated ? () => navigate('/cursor-ide') : () => setShowAuthModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-lg px-12 py-4"
            >
              {isAuthenticated ? "Try Cursor IDE" : "Try Cursor IDE"}
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Free to start
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
              Cancel anytime
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="w-6 h-6 text-blue-400" />
                <span className="text-xl font-bold text-white">DevMindX</span>
              </div>
              <p className="text-gray-400">
                AI-powered development environment for the next generation of creators.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AI Models</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Reference</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DevMindX. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />
    </div>
  );
}