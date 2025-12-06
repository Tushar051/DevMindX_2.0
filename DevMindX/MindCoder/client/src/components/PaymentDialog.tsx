import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { XIcon, CreditCardIcon, SmartphoneIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  modelId: string;
  modelName: string;
  price: number;
}

export function PaymentDialog({
  isOpen,
  onClose,
  onSuccess,
  modelId,
  modelName,
  price
}: PaymentDialogProps) {
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'upi'>('credit');
  const [months, setMonths] = useState(1);
  const [processing, setProcessing] = useState(false);

  // Card payment fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // UPI field
  const [upiId, setUpiId] = useState('');

  if (!isOpen) return null;

  const totalPrice = price * months;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const userStr = localStorage.getItem('devmindx_user');
      if (!userStr) {
        throw new Error('User not logged in');
      }

      const userData = JSON.parse(userStr);

      const paymentDetails: any = {};
      
      if (paymentMethod === 'credit' || paymentMethod === 'debit') {
        if (!cardNumber || !cardExpiry || !cardCVV || !cardholderName) {
          throw new Error('Please fill all card details');
        }
        paymentDetails.cardLast4 = cardNumber.slice(-4);
        paymentDetails.cardExpiry = cardExpiry;
        paymentDetails.cardholderName = cardholderName;
      } else if (paymentMethod === 'upi') {
        if (!upiId) {
          throw new Error('Please enter UPI ID');
        }
        paymentDetails.upiId = upiId;
      }

      const response = await fetch('/api/llm/models/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('devmindx_token')}`,
          'x-user-id': userData.id.toString()
        },
        body: JSON.stringify({
          modelId,
          months,
          paymentMethod,
          paymentDetails
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Payment failed');
      }

      const data = await response.json();

      toast({
        title: 'Purchase Successful!',
        description: `${modelName} subscription activated for ${months} month(s)`,
      });

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl w-full max-w-md shadow-2xl border border-gray-700 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Purchase {modelName}</h2>
            <p className="text-sm text-gray-400 mt-1">Complete your payment to activate</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Subscription Duration */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-semibold">Subscription Duration</Label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 6].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMonths(m)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    months === m
                      ? 'border-blue-500 bg-blue-500/20 text-white'
                      : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <div className="text-lg font-bold">{m}</div>
                  <div className="text-xs">{m === 1 ? 'Month' : 'Months'}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label className="text-white text-sm font-semibold">Payment Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('credit')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'credit'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                <span className="text-xs">Credit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('debit')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'debit'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <CreditCardIcon className="w-5 h-5" />
                <span className="text-xs">Debit</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                  paymentMethod === 'upi'
                    ? 'border-blue-500 bg-blue-500/20 text-white'
                    : 'border-gray-600 bg-gray-800/50 text-gray-300 hover:border-gray-500'
                }`}
              >
                <SmartphoneIcon className="w-5 h-5" />
                <span className="text-xs">UPI</span>
              </button>
            </div>
          </div>

          {/* Card Details */}
          {(paymentMethod === 'credit' || paymentMethod === 'debit') && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber" className="text-white text-sm">
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  type="text"
                  value={cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '');
                    if (value.length <= 16 && /^\d*$/.test(value)) {
                      setCardNumber(value);
                    }
                  }}
                  placeholder="1234 5678 9012 3456"
                  className="bg-gray-800 border-gray-600 text-white"
                  maxLength={19}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardholderName" className="text-white text-sm">
                  Cardholder Name
                </Label>
                <Input
                  id="cardholderName"
                  type="text"
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                  placeholder="JOHN DOE"
                  className="bg-gray-800 border-gray-600 text-white uppercase"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cardExpiry" className="text-white text-sm">
                    Expiry Date
                  </Label>
                  <Input
                    id="cardExpiry"
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 4) {
                        setCardExpiry(formatExpiry(value));
                      }
                    }}
                    placeholder="MM/YY"
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardCVV" className="text-white text-sm">
                    CVV
                  </Label>
                  <Input
                    id="cardCVV"
                    type="password"
                    value={cardCVV}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 3 && /^\d*$/.test(value)) {
                        setCardCVV(value);
                      }
                    }}
                    placeholder="123"
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* UPI Details */}
          {paymentMethod === 'upi' && (
            <div className="space-y-2">
              <Label htmlFor="upiId" className="text-white text-sm">
                UPI ID
              </Label>
              <Input
                id="upiId"
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="bg-gray-800 border-gray-600 text-white"
                required
              />
              <p className="text-xs text-gray-400">
                Enter your UPI ID (e.g., 9876543210@paytm)
              </p>
            </div>
          )}

          {/* Price Summary */}
          <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 border border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Price per month</span>
              <span className="text-white font-semibold">₹{price}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Duration</span>
              <span className="text-white font-semibold">{months} month(s)</span>
            </div>
            <div className="border-t border-gray-700 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-white font-bold">Total Amount</span>
                <span className="text-2xl font-bold text-blue-400">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
              disabled={processing}
            >
              {processing ? 'Processing...' : `Pay ₹${totalPrice}`}
            </Button>
          </div>

          {/* Security Note */}
          <p className="text-xs text-center text-gray-400">
            🔒 Your payment information is secure and encrypted
          </p>
        </form>
      </div>
    </div>
  );
}
