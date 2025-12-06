import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { PaymentDialog } from '@/components/PaymentDialog';
import {
  UserIcon, CreditCardIcon, ActivityIcon, LogOutIcon,
  CheckCircleIcon, XCircleIcon, ClockIcon, TrendingUpIcon
} from 'lucide-react';

interface ModelSubscription {
  id: string;
  name: string;
  description: string;
  price: number;
  tokensPerMonth: number;
  tokensUsed: number;
  tokensRemaining: number;
  purchased: boolean;
  purchaseDate?: string;
  expirationDate?: string;
  expired?: boolean;
  free?: boolean;
  features: string[];
}

interface Usage {
  totalTokens: number;
  totalCost: number;
  lastReset: Date;
  byModel: {
    together: number;
    gemini: number;
    chatgpt: number;
    claude: number;
    deepseek: number;
  };
}

export default function AccountPage() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [models, setModels] = useState<ModelSubscription[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelSubscription | null>(null);

  useEffect(() => {
    fetchAccountData();
  }, []);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      
      // Get user info from localStorage
      const userStr = localStorage.getItem('devmindx_user');
      if (!userStr) {
        throw new Error('User not logged in');
      }
      
      const userData = JSON.parse(userStr);
      setUser(userData);

      // Get LLM models and usage
      const modelsResponse = await fetch('/api/llm/models', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
          'x-user-id': userData.id.toString()
        }
      });

      if (modelsResponse.ok) {
        const data = await modelsResponse.json();
        setModels(data.models);
        setUsage(data.usage);
      } else {
        const errorText = await modelsResponse.text();
        console.error('API Error:', errorText);
        throw new Error('Failed to fetch models');
      }
    } catch (error) {
      console.error('Error fetching account data:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load account data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('devmindx_token');
    localStorage.removeItem('devmindx_user');
    setLocation('/');
  };

  const handlePurchase = (model: ModelSubscription) => {
    setSelectedModel(model);
    setShowPaymentDialog(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh account data after successful payment
    fetchAccountData();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (model: ModelSubscription) => {
    if (model.free) {
      return (
        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-semibold">
          FREE
        </span>
      );
    }
    
    if (!model.purchased) {
      return (
        <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-semibold">
          NOT PURCHASED
        </span>
      );
    }
    
    if (model.expired) {
      return (
        <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-semibold flex items-center gap-1">
          <XCircleIcon className="w-3 h-3" />
          EXPIRED
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1">
        <CheckCircleIcon className="w-3 h-3" />
        ACTIVE
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading account data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <div className="border-b border-gray-700 bg-black/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">My Account</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/')}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Back to Home
            </Button>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-400 hover:bg-red-500/10"
            >
              <LogOutIcon className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* User Info Card */}
        <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <UserIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username || 'User'}</h2>
              <p className="text-gray-400">{user?.email || 'email@example.com'}</p>
            </div>
          </div>
        </Card>

        {/* Usage Overview */}
        {usage && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ActivityIcon className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Total Tokens Used</h3>
              </div>
              <p className="text-3xl font-bold text-blue-400">{usage.totalTokens.toLocaleString()}</p>
              <p className="text-sm text-gray-400 mt-1">This month</p>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCardIcon className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Total Cost</h3>
              </div>
              <p className="text-3xl font-bold text-green-400">₹{usage.totalCost.toFixed(2)}</p>
              <p className="text-sm text-gray-400 mt-1">This month</p>
            </Card>

            <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-2">
                <ClockIcon className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Last Reset</h3>
              </div>
              <p className="text-xl font-bold text-purple-400">
                {new Date(usage.lastReset).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-400 mt-1">Monthly cycle</p>
            </Card>
          </div>
        )}

        {/* LLM Subscriptions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUpIcon className="w-6 h-6" />
            LLM Subscriptions
          </h2>

          <ScrollArea className="h-[600px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {models.map((model) => (
                <Card
                  key={model.id}
                  className={`bg-black/40 backdrop-blur-sm border-2 p-6 transition-all ${
                    model.purchased && !model.expired
                      ? 'border-blue-500/50 shadow-lg shadow-blue-500/20'
                      : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{model.name}</h3>
                      <p className="text-sm text-gray-400">{model.description}</p>
                    </div>
                    {getStatusBadge(model)}
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    {model.free ? (
                      <p className="text-2xl font-bold text-green-400">FREE</p>
                    ) : (
                      <p className="text-2xl font-bold text-white">
                        ₹{model.price}
                        <span className="text-sm text-gray-400 font-normal">/month</span>
                      </p>
                    )}
                  </div>

                  {/* Token Usage */}
                  {(model.purchased || model.free) && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Tokens Used</span>
                        <span className="text-white font-semibold">
                          {model.tokensUsed.toLocaleString()} / {model.tokensPerMonth.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            model.tokensUsed / model.tokensPerMonth > 0.9
                              ? 'bg-red-500'
                              : model.tokensUsed / model.tokensPerMonth > 0.7
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min((model.tokensUsed / model.tokensPerMonth) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {model.tokensRemaining.toLocaleString()} tokens remaining
                      </p>
                    </div>
                  )}

                  {/* Subscription Dates */}
                  {model.purchased && !model.free && (
                    <div className="mb-4 space-y-1">
                      <p className="text-sm text-gray-400">
                        Purchased: {formatDate(model.purchaseDate!)}
                      </p>
                      <p className="text-sm text-gray-400">
                        Expires: {formatDate(model.expirationDate!)}
                      </p>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-300 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-2">
                      {model.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-700/50 text-gray-300 rounded text-xs"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action Button */}
                  {!model.purchased && !model.free && (
                    <Button
                      onClick={() => handlePurchase(model)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      Purchase Now
                    </Button>
                  )}

                  {model.expired && (
                    <Button
                      onClick={() => handlePurchase(model)}
                      className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                    >
                      Renew Subscription
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Usage by Model */}
        {usage && (
          <Card className="bg-black/40 backdrop-blur-sm border-gray-700 p-6">
            <h3 className="text-xl font-bold text-white mb-4">Token Usage by Model</h3>
            <div className="space-y-4">
              {Object.entries(usage.byModel).map(([modelId, tokens]) => {
                const model = models.find(m => m.id === modelId);
                if (!model || tokens === 0) return null;

                return (
                  <div key={modelId}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">{model.name}</span>
                      <span className="text-white font-semibold">{tokens.toLocaleString()} tokens</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min((tokens / usage.totalTokens) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Payment Dialog */}
      {selectedModel && (
        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          onSuccess={handlePaymentSuccess}
          modelId={selectedModel.id}
          modelName={selectedModel.name}
          price={selectedModel.price}
        />
      )}
    </div>
  );
}
