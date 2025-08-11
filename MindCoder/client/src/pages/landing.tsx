import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/components/user-profile";
import { Code, Brain, Zap, Users, CheckCircle, Star, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { CardCarousel } from "@/components/ui/card-carousel";
import { SlideButton } from "@/components/ui/slide-button";
import { TextScroll } from "@/components/ui/text-scroll";
import { useToast } from "@/hooks/use-toast";
import { AIModel } from "@shared/types";


export default function Landing() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showDemoVideo, setShowDemoVideo] = useState(false);
  const videoRef = useRef(null);
  // Alternative: Use a simple demo with HTML5 canvas or animated GIF
  const [demoMode, setDemoMode] = useState('video'); // 'video', 'gif', 'slides'
  const [purchasingModel, setPurchasingModel] = useState<string | null>(null);
  
  // Function to purchase an AI model
  // State for payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Function to open payment modal
  const openPaymentModal = (modelId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to purchase AI models",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedModel(modelId);
    setShowPaymentModal(true);
  };

  // Function to close payment modal
  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedModel(null);
    setPaymentMethod('credit');
    setCardNumber('');
    setCardExpiry('');
    setCvv('');
    setCardName('');
    setUpiId('');
    setPaymentStatus('idle');
    setErrors({});
  };

  // Function to validate payment form
  const validatePaymentForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (paymentMethod === 'credit' || paymentMethod === 'debit') {
      // Card number validation
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      } else {
        const digitsOnly = cardNumber.replace(/\s/g, '');
        if (!/^\d{15,16}$/.test(digitsOnly)) {
          newErrors.cardNumber = 'Card number must be 15-16 digits';
        } else {
          // Implement Luhn algorithm for card number validation
          let sum = 0;
          let shouldDouble = false;
          for (let i = digitsOnly.length - 1; i >= 0; i--) {
            let digit = parseInt(digitsOnly.charAt(i));
            if (shouldDouble) {
              digit *= 2;
              if (digit > 9) digit -= 9;
            }
            sum += digit;
            shouldDouble = !shouldDouble;
          }
          if (sum % 10 !== 0) {
            newErrors.cardNumber = 'Invalid card number';
          }
          
          // Check card type based on first digits
          const firstDigits = digitsOnly.substring(0, 4);
          if (firstDigits.startsWith('4')) {
            // Visa validation
            if (digitsOnly.length !== 16) {
              newErrors.cardNumber = 'Invalid Visa card number';
            }
          } else if (firstDigits.startsWith('5')) {
            // Mastercard validation
            if (digitsOnly.length !== 16) {
              newErrors.cardNumber = 'Invalid Mastercard number';
            }
          } else if (firstDigits.startsWith('34') || firstDigits.startsWith('37')) {
            // Amex validation
            if (digitsOnly.length !== 15) {
              newErrors.cardNumber = 'Invalid American Express number';
            }
          }
        }
      }
      
      // Card expiry validation
      if (!cardExpiry.trim()) {
        newErrors.cardExpiry = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
        newErrors.cardExpiry = 'Invalid format (MM/YY)';
      } else {
        // Check if card is expired
        const [month, year] = cardExpiry.split('/');
        const expiryDate = new Date(2000 + parseInt(year), parseInt(month));
        const currentDate = new Date();
        if (expiryDate < currentDate) {
          newErrors.cardExpiry = 'Card has expired';
        }
      }
      
      // CVV validation
      if (!cardCvv.trim()) {
        newErrors.cardCvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(cardCvv)) {
        newErrors.cardCvv = 'Invalid CVV';
      } else {
        // For Amex, CVV should be 4 digits
        const digitsOnly = cardNumber.replace(/\s/g, '');
        if ((digitsOnly.startsWith('34') || digitsOnly.startsWith('37')) && cardCvv.length !== 4) {
          newErrors.cardCvv = 'Amex cards require a 4-digit CVV';
        } else if (!(digitsOnly.startsWith('34') || digitsOnly.startsWith('37')) && cardCvv.length !== 3) {
          newErrors.cardCvv = 'CVV must be 3 digits';
        }
      }
      
      // Card name validation
      if (!cardName.trim()) {
        newErrors.cardName = 'Name on card is required';
      } else if (cardName.trim().length < 3) {
        newErrors.cardName = 'Please enter full name as on card';
      } else if (!/^[a-zA-Z\s]+$/.test(cardName)) {
        newErrors.cardName = 'Name should contain only letters';
      }
    } else if (paymentMethod === 'upi') {
      // UPI ID validation
      if (!upiId.trim()) {
        newErrors.upiId = 'UPI ID is required';
      } else if (!/^[a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+$/.test(upiId)) {
        newErrors.upiId = 'Invalid UPI ID format (e.g. username@upi)';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Function to format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Function to process payment
  const processPayment = async () => {
    if (!selectedModel) return;
    
    if (!validatePaymentForm()) {
      return;
    }
    
    setIsProcessingPayment(true);
    setPurchasingModel(selectedModel);
    setPaymentStatus('processing');
    
    // Simulate payment gateway integration
    try {
      // In a real implementation, this would be a call to a payment gateway API
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate for demo purposes
          if (Math.random() < 0.9) {
            resolve({
              transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
              status: 'success'
            });
          } else {
            reject(new Error('Payment gateway declined the transaction'));
          }
        }, 3000); // Simulate 3 second processing time for more realism
      });
      
      // After successful payment gateway response, call the API to update user's purchased models
      const purchaseRes = await fetch('/api/ai/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ modelId: selectedModel })
      });

      if (!purchaseRes.ok) {
        throw new Error('Failed to register purchase with server');
      }

      const data = await purchaseRes.json();
      
      // In a real implementation, you would make an actual API call like this:
      /*
      const response = await fetch('/api/ai/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
        },
        body: JSON.stringify({ 
          modelId: selectedModel,
          paymentMethod: paymentMethod,
          // Include masked payment details for record-keeping
          paymentDetails: paymentMethod === 'upi' ? 
            { upiId: upiId } : 
            { 
              cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
              cardExpiry: cardExpiry,
              cardholderName: cardName 
            }
        }),
      });
      
      // Check if response is HTML instead of JSON (common server error)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        throw new Error('Server returned HTML instead of JSON. The API endpoint may not exist.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to register purchase with server');
      }
      
      const data = await response.json();
      */
      
      // Update payment status to success
      setPaymentStatus('success');
      
      // Show success toast with more details
      toast({
        title: "Payment Successful",
        description: `Your purchase of ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} was successful. Transaction ID: ${data.transactionId || 'TXN' + Date.now()}`,
        variant: "default"
      });
      
      // Wait a moment to show success message before redirecting
      setTimeout(() => {
        // Redirect to IDE after successful purchase
        closePaymentModal();
        navigate('/ide');
      }, 2500);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('error');
      
      // Show detailed error message based on the type of error
      let errorMessage = "There was an error processing your payment. Please try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('declined')) {
          errorMessage = "Your payment was declined. Please try a different payment method.";
        } else if (error.message.includes('server')) {
          errorMessage = "Your payment was processed, but we couldn't update your account. Please contact support.";
        }
      }
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsProcessingPayment(false);
      setPurchasingModel(null);
    }
  };

  // Function to handle purchase button click
  const purchaseModel = (modelId: string) => {
    openPaymentModal(modelId);
  };
  
  // Demo slides data
  const demoSlides = [
    {
      title: "AI-Powered Code Generation",
      description: "Simply describe what you want to build, and our AI generates complete applications",
      image: "🤖",
      color: "from-blue-500 to-purple-500"
    },
    {
      title: "Multiple Framework Support",
      description: "Works with React, Vue, Angular, Node.js, Python and more",
      image: "⚡",
      color: "from-green-500 to-blue-500"
    },
    {
      title: "Real-time Collaboration",
      description: "AI understands your project context and helps you build faster",
      image: "🚀",
      color: "from-purple-500 to-pink-500"
    }
  ];
  
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (showDemoVideo && demoMode === 'slides') {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % demoSlides.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [showDemoVideo, demoMode]);

  const handleWatchDemoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDemoMode('slides'); // Start with slides demo
    setShowDemoVideo(true);
  };

  const handleCloseVideo = (e: React.MouseEvent<HTMLButtonElement>) => {

    e.preventDefault();
    e.stopPropagation();
    setShowDemoVideo(false);
    setCurrentSlide(0);
  };

  const handleVideoEnded = () => {
    setShowDemoVideo(false);
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8 text-blue-500" />,
      title: "Multiple AI Models",
      description: "Utilize Together AI for code generation and assistance"
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
      name: "Together AI",
      provider: "Together AI",
      description: "Open-source models for various development tasks",
      capabilities: ["Code Generation", "Debugging", "Refactoring", "Documentation", "Code Review", "Architecture Design", "Testing", "Optimization", "Image Analysis", "Multi-language", "Integration"],
      badge: "Unified AI"
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
                    <Button onClick={() => navigate('/projects')} className="bg-green-600 hover:bg-green-700">
                      My Projects
                    </Button>
                  </div>
                  <UserProfile />
                </>
              ) : (
                <>
                  <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700">
                    Login
                  </Button>
                  <Button onClick={() => navigate('/signup')} className="bg-purple-600 hover:bg-purple-700 ml-2">
                    Sign Up
                  </Button>
                </>
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
          {/* <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your ideas into complete applications using natural language. 
            Our AI IDE supports multiple LLM models and generates production-ready code instantly.
          </p> */}
          
           <TextScroll
  className="font-display text-center text-xl font-semibold tracking-tight text-gray-300 max-w-3xl mx-auto md:text-2xl md:leading-relaxed"
  text="Transform your ideas into complete applications using natural language. Our AI IDE supports multiple LLM models and generates production-ready code instantly. "
  default_velocity={5}
/>

          <div className="flex flex-col gap-4 items-center mb-12">
          <SlideButton
            onComplete={() => isAuthenticated ? navigate('/ide') : navigate('/login')}
            className="[&>*]:!text-blue-600 hover:[&>*]:!text-white bg-blue-600 hover:bg-blue-700"
          >
            Launch AI IDE
          </SlideButton>
          
          <Button 
            size="lg" 
            variant="outline" 
            className="border-blue-600 text-blue-400 hover:bg-blue-600 hover:text-white text-lg px-8 py-4"
            onClick={() => setShowDemoVideo(true)}
          >
            Watch Demo
          </Button>
        </div>
        </div>
      </section>

      {/* Demo Modal with Multiple Options */}
      {showDemoVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => handleCloseVideo(e as unknown as React.MouseEvent<HTMLButtonElement>)}
        >
          <div 
            className="relative w-full max-w-4xl mx-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleCloseVideo}
              className="absolute -top-4 -right-4 text-white text-4xl font-bold leading-none focus:outline-none z-50 bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center hover:bg-gray-700 transition-colors"
              aria-label="Close demo"
            >
              ×
            </button>

            {/* Demo Mode Selector */}
            <div className="mb-4 flex justify-center space-x-4">
              <Button
                onClick={() => setDemoMode('slides')}
                className={`${demoMode === 'slides' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700`}
              >
                Interactive Demo
              </Button>
              <Button
                onClick={() => setDemoMode('video')}
                className={`${demoMode === 'video' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700`}
              >
                Video Demo
              </Button>
              <Button
                onClick={() => setDemoMode('gif')}
                className={`${demoMode === 'gif' ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-700`}
              >
                GIF Demo
              </Button>
            </div>

            {/* Demo Content */}
            <div className="bg-gray-900 rounded-lg p-6" style={{ minHeight: '400px' }}>
              
              {/* Interactive Slides Demo */}
              {demoMode === 'slides' && (
                <div className="text-center">
                  <div className={`bg-gradient-to-r ${demoSlides[currentSlide].color} rounded-lg p-8 mb-6`}>
                    <div className="text-6xl mb-4">{demoSlides[currentSlide].image}</div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      {demoSlides[currentSlide].title}
                    </h3>
                    <p className="text-lg text-white/90">
                      {demoSlides[currentSlide].description}
                    </p>
                  </div>
 
                  
                  {/* Slide indicators */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {demoSlides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full ${
                          index === currentSlide ? 'bg-blue-500' : 'bg-gray-500'
                        }`}
                      />
                    ))}
                  </div>
                  
                  <div className="text-gray-400">
                    Slide {currentSlide + 1} of {demoSlides.length}
                  </div>
                </div>
              )}

              {/* Video Demo */}
              {demoMode === 'video' && (
                <div className="text-center">
                  <video
                    controls
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto rounded-lg shadow-lg bg-black mb-4"
                    style={{ maxHeight: '60vh' }}
                    onError={(e) => {
                      console.error('Video error:', e.currentTarget.error);
                      console.log('Failed source:', e.currentTarget.currentSrc);
                    }}
                    onLoadedData={() => {
                      console.log('Video loaded:', videoRef.current && (videoRef.current as HTMLVideoElement).currentSrc);
                    }}
                  >
                    {/* Your video FIRST - browser will try this first */}
                    <source src="https://www.youtube.com/watch?v=m3o-p7dOGTo" />
                    
                    {/* Fallback videos only if yours fails */}
                    <source src="https://youtu.be/m3o-p7dOGTo?si=13Nsiam7B9XNE0rj" type="video/mp4" />
                    <source src="https://youtu.be/m3o-p7dOGTo?si=13Nsiam7B9XNE0rj" type="video/mp4" />
                    
                    Your browser does not support the video tag.
                  </video>
                  <p className="text-gray-400">
                    {/* Show which video is actually playing */}
                    Demo video - DevMindX AI IDE in action
                  </p>
                </div>
              )}

              {/* GIF Demo */}
              {demoMode === 'gif' && (
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-8 mb-4">
                    <div className="animate-pulse text-4xl mb-4">🎬</div>
                    <h3 className="text-xl font-bold text-white mb-2">Animated Demo</h3>
                    <p className="text-white/90">
                      This would show an animated GIF of your IDE in action
                    </p>
                  </div>
                  
                  {/* Simulated coding animation */}
                  <div className="bg-gray-800 rounded-lg p-4 text-left font-mono text-sm text-green-400">
                    <div className="mb-2">$ devmindx create new-app</div>
                    <div className="mb-2 animate-pulse">🤖 AI: What type of app would you like to create?</div>
                    <div className="mb-2">👤 User: A todo app with React and TypeScript</div>
                    <div className="mb-2 animate-pulse">🤖 AI: Creating your React TypeScript todo app...</div>
                    <div className="text-blue-400">✅ Project created successfully!</div>
                  </div>
                  
                  <p className="text-gray-400 mt-4">
                    This demonstrates the AI-powered development workflow
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-center">
              <Button
                onClick={isAuthenticated ? () => navigate('/ide') : () => navigate('/login')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Try DevMindX Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}

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
        
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-bold">FREE</div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">Together AI</CardTitle>
                    <p className="text-gray-400">Basic Plan</p>
                  </div>
                  <Badge variant="secondary" className="absolute top-10 right-10 bg-green-600 text-white text-xs">
                    Always Available
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">Open-source models for various development tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> <span><span className="font-bold">10,000</span> tokens per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> <span><span className="font-bold">$0.00</span> per token</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" /> <span>Basic complexity tasks</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Code Generation', 'Debugging', 'Refactoring', 'Documentation', 'Code Review'].map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/ide')}
                >
                  Start Using Now
                </Button>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-bold">POPULAR</div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">Gemini</CardTitle>
                    <p className="text-gray-400">Standard Plan</p>
                  </div>
                  <Badge variant="secondary" className="absolute top-10 right-10 bg-blue-600 text-white text-xs">
                    ₹749/month
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">Google's multimodal AI model with advanced reasoning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" /> <span><span className="font-bold">50,000</span> tokens per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" /> <span><span className="font-bold">₹0.15</span> per token</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-blue-500 mr-2" /> <span>Medium complexity tasks</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Code Generation', 'Image Analysis', 'Reasoning', 'Documentation', 'Testing'].map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => purchaseModel('gemini')}
                  disabled={purchasingModel === 'gemini'}
                >
                  {purchasingModel === 'gemini' ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-bold">PREMIUM</div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">ChatGPT</CardTitle>
                    <p className="text-gray-400">Premium Plan</p>
                  </div>
                  <Badge variant="secondary" className="absolute top-10 right-10 bg-purple-600 text-white text-xs">
                    ₹1,499/month
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">OpenAI's powerful language model for code and natural language</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span><span className="font-bold">100,000</span> tokens per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span><span className="font-bold">₹0.38</span> per token</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span>Complex tasks & reasoning</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Natural Language', 'Code Completion', 'Problem Solving', 'Explanation', 'Debugging'].map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => purchaseModel('chatgpt')}
                  disabled={purchasingModel === 'chatgpt'}
                >
                  {purchasingModel === 'chatgpt' ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-bold">PREMIUM</div>  
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">Claude</CardTitle>
                    <p className="text-gray-400">Premium Plan</p>
                  </div>
                  <Badge variant="secondary" className="absolute top-10 right-10 bg-purple-600 text-white text-xs">
                    ₹1,299/month
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">Anthropic's helpful, harmless, and honest AI assistant</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span><span className="font-bold">100,000</span> tokens per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span><span className="font-bold">$0.005</span> per token</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-purple-500 mr-2" /> <span>Complex tasks & long context</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Long Context', 'Code Understanding', 'Documentation', 'Explanation', 'Reasoning'].map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => purchaseModel('claude')}
                  disabled={purchasingModel === 'claude'}
                >
                  {purchasingModel === 'claude' ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
            
            <Card className="bg-gray-800/50 border-gray-700 hover:bg-gray-800/70 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white px-3 py-1 text-xs font-bold">ADVANCED</div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">DeepSeek</CardTitle>
                    <p className="text-gray-400">Advanced Plan</p>
                  </div>
                  <Badge variant="secondary" className="absolute top-10 right-10 bg-indigo-600 text-white text-xs">
                    ₹1,125/month
                  </Badge>
                </div>
                <CardDescription className="text-gray-300">DeepSeek's advanced AI model for specialized tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2" /> <span><span className="font-bold">50,000</span> tokens per month</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2" /> <span><span className="font-bold">₹0.23</span> per token</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-indigo-500 mr-2" /> <span>Medium complexity tasks</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Features:</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Code Generation', 'Debugging', 'Optimization', 'Documentation', 'Architecture Design'].map((capability, capIndex) => (
                        <Badge key={capIndex} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {capability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button 
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => purchaseModel('deepseek')}
                  disabled={purchasingModel === 'deepseek'}
                >
                  {purchasingModel === 'deepseek' ? 'Processing...' : 'Buy Now'}
                </Button>
              </div>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-900 to-purple-900 border-gray-700 hover:from-blue-800 hover:to-purple-800 transition-colors relative overflow-hidden">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <CardTitle className="text-white text-xl">Enterprise Plan</CardTitle>
                    <p className="text-gray-300">Custom Solution</p>
                  </div>
                  <Badge variant="secondary" className="bg-amber-600 text-white text-xs">
                    Custom Pricing
                  </Badge>
                </div>
                <CardDescription className="text-gray-200">Access to all AI models with unlimited tokens and priority support</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-2">Plan Details:</h4>
                    <ul className="space-y-2 text-sm text-gray-200">
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-amber-500 mr-2" /> <span>Access to <span className="font-bold">ALL</span> AI models</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-amber-500 mr-2" /> <span>Unlimited tokens with volume discounts</span>
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-amber-500 mr-2" /> <span>Priority support & custom integrations</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Button className="w-full bg-amber-600 hover:bg-amber-700">
                  Contact Sales
                </Button>
              </div>
            </Card>
          </div>
          
          <div className="mt-12 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Compare AI Model Capabilities</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800/70">
                    <th className="p-3 text-left text-gray-300 border-b border-gray-700">Model</th>
                    <th className="p-3 text-left text-gray-300 border-b border-gray-700">Complexity</th>
                    <th className="p-3 text-left text-gray-300 border-b border-gray-700">Tokens/Month</th>
                    <th className="p-3 text-left text-gray-300 border-b border-gray-700">Price/Token</th>
                    <th className="p-3 text-left text-gray-300 border-b border-gray-700">Monthly Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="hover:bg-gray-800/50">
                    <td className="p-3 border-b border-gray-700 text-white">Together AI</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">Basic</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">10,000</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">₹0.00</td>
                    <td className="p-3 border-b border-gray-700 text-green-500 font-bold">Free</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50">
                    <td className="p-3 border-b border-gray-700 text-white">Gemini</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">Medium</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">50,000</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">₹0.15</td>
                    <td className="p-3 border-b border-gray-700 text-blue-500 font-bold">₹749</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50">
                    <td className="p-3 border-b border-gray-700 text-white">ChatGPT</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">Complex</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">100,000</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">₹0.38</td>
                    <td className="p-3 border-b border-gray-700 text-purple-500 font-bold">₹1,499</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50">
                    <td className="p-3 border-b border-gray-700 text-white">Claude</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">Complex</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">100,000</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">₹0.38</td>
                    <td className="p-3 border-b border-gray-700 text-purple-500 font-bold">₹1,299</td>
                  </tr>
                  <tr className="hover:bg-gray-800/50">
                    <td className="p-3 border-b border-gray-700 text-white">DeepSeek</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">Medium</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">50,000</td>
                    <td className="p-3 border-b border-gray-700 text-gray-300">₹0.23</td>
                    <td className="p-3 border-b border-gray-700 text-indigo-500 font-bold">₹1,125</td>
                  </tr>
                </tbody>
              </table>
            </div>
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
              onClick={isAuthenticated ? () => navigate('/ide') : () => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-lg px-12 py-4"
            >
              {isAuthenticated ? "Go to Your IDE" : "Start Building Now"}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            {/* Removed the Try Cursor IDE button as requested */}
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

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">
                Secure Checkout
              </h3>
              <button
                onClick={closePaymentModal}
                className="text-gray-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4 mb-6">
              <h4 className="text-white font-medium mb-2">Order Summary</h4>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-300">{selectedModel ? `${selectedModel.charAt(0).toUpperCase()}${selectedModel.slice(1)} Subscription` : 'Subscription'}</p>
                  <p className="text-xs text-gray-400">Monthly access to AI model</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    {selectedModel === 'gemini' ? '₹749.00' : 
                     selectedModel === 'chatgpt' ? '₹1,499.00' : 
                     selectedModel === 'claude' ? '₹1,499.00' : 
                     selectedModel === 'deepseek' ? '₹1,125.00' : '₹0.00'}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Payment Method Selection */}
            <div className="mb-6">
              <h4 className="text-white font-medium mb-3">Payment Method</h4>
              <div className="flex justify-between mb-4">
                <button
                  className={`px-4 py-2 rounded-lg flex items-center justify-center ${paymentMethod === 'credit' ? 'bg-blue-600 text-white border-2 border-blue-400' : 'bg-gray-800 text-gray-300 border border-gray-700'} w-1/3 mr-2`}
                  onClick={() => setPaymentMethod('credit')}
                >
                  <span className="text-sm">Credit Card</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center justify-center ${paymentMethod === 'debit' ? 'bg-blue-600 text-white border-2 border-blue-400' : 'bg-gray-800 text-gray-300 border border-gray-700'} w-1/3 mr-2`}
                  onClick={() => setPaymentMethod('debit')}
                >
                  <span className="text-sm">Debit Card</span>
                </button>
                <button
                  className={`px-4 py-2 rounded-lg flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-blue-600 text-white border-2 border-blue-400' : 'bg-gray-800 text-gray-300 border border-gray-700'} w-1/3`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <span className="text-sm">UPI</span>
                </button>
              </div>
              
              {/* Card Payment Form */}
              {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
                <div className="space-y-4">
                  <div className="flex justify-between mb-2">
                    <div className="flex space-x-2">
                      <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">VISA</div>
                      <div className="w-10 h-6 bg-red-600 rounded flex items-center justify-center text-white text-xs font-bold">MC</div>
                      <div className="w-10 h-6 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">AMEX</div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Secure Payment
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      className={`w-full px-3 py-2 bg-gray-800 border ${errors.cardName ? 'border-red-500' : 'border-gray-700'} rounded-md text-white`}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                    {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-700'} rounded-md text-white`}
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                      />
                      <div className="absolute right-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                    </div>
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.cardExpiry ? 'border-red-500' : 'border-gray-700'} rounded-md text-white`}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                      />
                      {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">CVV</label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="123"
                          className={`w-full px-3 py-2 bg-gray-800 border ${errors.cardCvv ? 'border-red-500' : 'border-gray-700'} rounded-md text-white`}
                          value={cardCvv}
                          onChange={(e) => setCvv(e.target.value)}
                          maxLength={4}
                        />
                        <div className="absolute right-3 top-2.5 text-gray-400 cursor-help" title="3 or 4 digit security code on the back of your card">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      {errors.cardCvv && <p className="text-red-500 text-xs mt-1">{errors.cardCvv}</p>}
                    </div>
                  </div>
                </div>
              )}
              
              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <div className="flex space-x-4">
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold">GPay</div>
                      <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">PhonePe</div>
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">Paytm</div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="username@upi"
                        className={`w-full px-3 py-2 bg-gray-800 border ${errors.upiId ? 'border-red-500' : 'border-gray-700'} rounded-md text-white`}
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                      <div className="absolute right-3 top-2.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
                        </svg>
                      </div>
                    </div>
                    {errors.upiId && <p className="text-red-500 text-xs mt-1">{errors.upiId}</p>}
                  </div>
                </div>
              )}
            </div>
            
            {/* Order Total */}
            <div className="border-t border-gray-700 pt-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Subtotal</span>
                <span className="text-white">
                  {selectedModel === 'gemini' ? '₹749.00' : 
                   selectedModel === 'chatgpt' ? '₹1,499.00' : 
                   selectedModel === 'claude' ? '₹1,499.00' : 
                   selectedModel === 'deepseek' ? '₹1,125.00' : '₹0.00'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-300">Tax (18% GST)</span>
                <span className="text-white">
                  {selectedModel === 'gemini' ? '₹134.82' : 
                   selectedModel === 'chatgpt' ? '₹269.82' : 
                   selectedModel === 'claude' ? '₹269.82' : 
                   selectedModel === 'deepseek' ? '₹202.50' : '₹0.00'}
                </span>
              </div>
              <div className="flex justify-between font-bold">
                <span className="text-gray-300">Total</span>
                <span className="text-white">
                  {selectedModel === 'gemini' ? '₹883.82' : 
                   selectedModel === 'chatgpt' ? '₹1,768.82' : 
                   selectedModel === 'claude' ? '₹1,768.82' : 
                   selectedModel === 'deepseek' ? '₹1,327.50' : '₹0.00'}
                </span>
              </div>
            </div>
            
            {/* Payment Status */}
            {paymentStatus === 'success' && (
              <div className="bg-green-900/30 border border-green-600 rounded-lg p-3 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-400">Payment successful! Redirecting to IDE...</span>
              </div>
            )}
            
            {paymentStatus === 'error' && (
              <div className="bg-red-900/30 border border-red-600 rounded-lg p-3 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-400">Payment failed. Please try again.</span>
              </div>
            )}
            
            {/* Pay Button */}
            <Button
              className={`w-full ${paymentStatus === 'processing' ? 'bg-blue-600' : 'bg-green-600 hover:bg-green-700'}`}
              onClick={processPayment}
              disabled={isProcessingPayment}
            >
              {paymentStatus === 'processing' ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </div>
              ) : 'Pay Now'}
            </Button>
            
            {/* Security Info */}
            <div className="mt-4 flex items-center justify-center text-xs text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secured by 256-bit encryption
            </div>
            
            <p className="text-xs text-gray-400 mt-2 text-center">
              This is a demo payment page. No actual payment will be processed.
            </p>
          </div>
        </div>
      )}

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
            <p>&copy; 2025 DevMindX. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}