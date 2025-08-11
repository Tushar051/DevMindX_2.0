import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AIModel } from "@shared/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, X } from "lucide-react";

interface UsageRecord {
  [modelId: string]: number;
}

export default function AccountSettings() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [models, setModels] = useState<AIModel[]>([]);
  const [usage, setUsage] = useState<UsageRecord>({});
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<string>('credit');
  const [cardNumber, setCardNumber] = useState<string>('');
  const [cardExpiry, setCardExpiry] = useState<string>('');
  const [cardCvv, setCvv] = useState<string>('');
  const [cardName, setCardName] = useState<string>('');
  const [upiId, setUpiId] = useState<string>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Function to validate payment form
  const validatePaymentForm = useCallback(() => {
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
  }, [paymentMethod, cardNumber, cardExpiry, cardCvv, cardName, upiId]);

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

  // Fetch data function, memoized with useCallback
  const fetchData = useCallback(async () => {
    try {
      const [modelsRes, usageRes] = await Promise.all([
        fetch("/api/ai/models", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("devmindx_token")}`,
          },
        }),
        fetch("/api/ai/usage", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("devmindx_token")}`,
          },
        }),
      ]);

      if (!modelsRes.ok) throw new Error("Failed to fetch models");
      if (!usageRes.ok) throw new Error("Failed to fetch usage");

      const modelsData: AIModel[] = await modelsRes.json();
      const usageData: UsageRecord = (await usageRes.json()).usage || {};

      setModels(modelsData);
      setUsage(usageData);
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error.message || "Failed to load account data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate, toast, setModels, setUsage, setLoading]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      return;
    }

    fetchData();
  }, [isAuthenticated, navigate, fetchData]); // fetchData is now a dependency

  const openPaymentModal = (modelId: string) => {
    setSelectedModel(modelId);
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentStatus('idle');
    setSelectedMonths(1);
    setPaymentMethod('credit');
    setCardNumber('');
    setCardExpiry('');
    setCvv('');
    setCardName('');
    setUpiId('');
    setErrors({});
  };

  const calculatePrice = (model: AIModel, months: number) => {
    if (!model || !model.price) return 0;
    return model.price * months;
  };

  const processPayment = async () => {
    if (!selectedModel) return;
    
    if (!validatePaymentForm()) {
      return;
    }
    
    setIsProcessingPayment(true);
    setPaymentStatus('processing');
    
    try {
      // Simulate payment gateway integration
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simulate 90% success rate for demo purposes
          if (true) { // Always succeed for demo purposes
            resolve({
              transactionId: 'txn_' + Math.random().toString(36).substring(2, 15),
              status: 'success'
            });
          } else {
            reject(new Error('Payment gateway declined the transaction'));
          }
        }, 3000); // Simulate 3 second processing time for more realism
      });
      
      // After successful payment, call the API to update user's purchased models
      console.log('Sending modelId:', selectedModel);
      
      const paymentDetails = paymentMethod === 'upi' ? 
        { upiId: upiId } : 
        { 
          cardLast4: cardNumber.replace(/\s/g, '').slice(-4),
          cardExpiry: cardExpiry,
          cardholderName: cardName 
        };
      
      const purchaseRes = await fetch('/api/ai/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`
        },
        body: JSON.stringify({ 
          modelId: selectedModel,
          paymentMethod: paymentMethod,
          paymentDetails: paymentDetails,
          months: selectedMonths
        })
      });

      if (!purchaseRes.ok) {
        throw new Error('Failed to register purchase with server');
      }

      await purchaseRes.json();
      
      // Update payment status to success
      setPaymentStatus('success');

      // Refresh data after purchase
      await fetchData();
      
      toast({
        title: "Purchase Successful",
        description: `Your purchase of ${selectedModel.charAt(0).toUpperCase() + selectedModel.slice(1)} for ${selectedMonths} month(s) was successful.`,
        variant: "default"
      });
      
      // Wait a moment to show success message before closing modal
      setTimeout(() => {
        closePaymentModal();
      }, 2500);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      setPaymentStatus('error');
      
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
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6 text-center text-white">Your AI Model Subscriptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="bg-gray-800/80 border-gray-700 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">{model.name}</CardTitle>
                <p className="text-gray-400 text-xs mt-1">{model.description}</p>
              </div>
              <Badge variant="secondary" className={model.purchased ? 'bg-green-600 text-white' : 'bg-blue-600 text-white'}>
                {model.purchased ? 'Active' : model.price === 0 ? 'Free' : 'Not Purchased'}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mb-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-300">Tokens Used:</span>
                  <span className="text-blue-300">{usage[model.id] || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-300">Remaining:</span>
                  <span className="text-green-300">{Math.max((model.tokensPerMonth || 0) - (usage[model.id] || 0), 0)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-300">Monthly Quota:</span>
                  <span className="text-gray-200">{model.tokensPerMonth?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-gray-300">Price:</span>
                  <span className="text-gray-200">{model.price === 0 ? 'Free' : `₹${model.price}/month`}</span>
                </div>
                {model.purchased && model.expirationDate && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-gray-300">Expires:</span>
                    <span className="text-red-300">{new Date(model.expirationDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {model.features?.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-xs bg-gray-700 text-gray-300">
                    {feature}
                  </Badge>
                ))}
              </div>
              {model.price !== 0 && (
                <Button 
                  className="w-full text-xs mt-2" 
                  size="sm"
                  onClick={() => openPaymentModal(model.id)}
                >
                  {model.purchased ? "Renew Subscription" : "Purchase"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <Button onClick={() => navigate(-1)} variant="outline">Back</Button>
      </div>
      
      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 max-w-md">
          <DialogHeader>
            <DialogTitle>Purchase Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedModel && models.find(m => m.id === selectedModel)?.name} - ₹{selectedModel && models.find(m => m.id === selectedModel)?.price}/month
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Subscription Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Subscription Duration</label>
              <Select 
                value={selectedMonths.toString()} 
                onValueChange={(value) => setSelectedMonths(parseInt(value))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                </SelectContent>
              </Select>
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
            
            {/* Order Summary */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 text-sm">Order Summary</h4>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <p className="text-gray-300">
                    {selectedModel && models.find(m => m.id === selectedModel)?.name} Subscription
                  </p>
                  <p className="text-xs text-gray-400">{selectedMonths} month(s)</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">
                    ₹{calculatePrice(models.find(m => m.id === selectedModel) as AIModel, selectedMonths).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Payment Status */}
            {paymentStatus === 'processing' && (
              <div className="bg-blue-900/20 text-blue-300 p-3 rounded-md text-sm flex items-center justify-center">
                Processing payment...
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <div className="bg-green-900/20 text-green-300 p-3 rounded-md text-sm flex items-center justify-center">
                Payment successful! Redirecting...
              </div>
            )}
            
            {paymentStatus === 'error' && (
              <div className="bg-red-900/20 text-red-300 p-3 rounded-md text-sm flex items-center justify-center">
                Payment failed. Please try again.
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={closePaymentModal}
                disabled={isProcessingPayment || paymentStatus === 'success'}
              >
                Cancel
              </Button>
              <Button 
                onClick={processPayment}
                disabled={isProcessingPayment || paymentStatus === 'success'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isProcessingPayment ? "Processing..." : `Pay ₹${calculatePrice(models.find(m => m.id === selectedModel) as AIModel, selectedMonths).toFixed(2)}`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}