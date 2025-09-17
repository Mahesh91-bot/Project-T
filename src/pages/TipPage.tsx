import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { DollarSign, CreditCard, Smartphone, User } from 'lucide-react';

interface WorkerData {
  id: string;
  name: string;
  email: string;
}

const TipPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [tipAmount, setTipAmount] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const predefinedAmounts = [50, 100, 200, 500];

  useEffect(() => {
    if (workerId) {
      fetchWorkerData();
    }
  }, [workerId]);

  const fetchWorkerData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, name, email')
        .eq('id', workerId)
        .eq('role', 'worker')
        .single();

      if (error) throw error;
      setWorker(data);
    } catch (error) {
      console.error('Error fetching worker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTip = async () => {
    if (!worker || tipAmount <= 0) return;

    setProcessing(true);
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Save tip to database
      const { error } = await supabase
        .from('tips')
        .insert({
          worker_id: worker.id,
          amount: tipAmount,
          customer_name: customerName.trim() || 'Anonymous'
        });

      if (error) throw error;

      // Redirect to review page
      navigate(`/review/${worker.id}?amount=${tipAmount}&customer=${encodeURIComponent(customerName || 'Anonymous')}`);
    } catch (error) {
      console.error('Error processing tip:', error);
      alert('Failed to process tip. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Worker Not Found</h1>
          <p className="text-gray-600">The QR code you scanned is not valid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Worker Info */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tip {worker.name}</h1>
            <p className="text-gray-600">Show your appreciation for great service</p>
          </div>

          {/* Customer Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name (Optional)
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
            />
          </div>

          {/* Predefined Amounts */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Choose Tip Amount
            </label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    tipAmount === amount
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">{formatCurrency(amount)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Or Enter Custom Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="number"
                min="1"
                value={tipAmount || ''}
                onChange={(e) => setTipAmount(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter amount"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="space-y-2">
              <div className="flex items-center p-3 border border-gray-200 rounded-lg bg-blue-50">
                <Smartphone className="h-5 w-5 text-blue-600 mr-3" />
                <span className="text-gray-700">UPI (Recommended)</span>
              </div>
              <div className="flex items-center p-3 border border-gray-200 rounded-lg">
                <CreditCard className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-500">Credit/Debit Card</span>
              </div>
            </div>
          </div>

          {/* Tip Button */}
          <button
            onClick={handleTip}
            disabled={tipAmount <= 0 || processing}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing...</span>
              </div>
            ) : (
              `Tip ${tipAmount > 0 ? formatCurrency(tipAmount) : 'Amount'}`
            )}
          </button>

          {/* Security Note */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Your payment is secure and goes directly to the service worker
          </p>
        </div>
      </div>
    </div>
  );
};

export default TipPage;