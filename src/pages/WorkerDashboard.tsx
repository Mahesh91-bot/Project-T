import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { QrCode, DollarSign, TrendingUp, Calendar, Copy, CheckCircle } from 'lucide-react';
import QRCode from 'qrcode';

interface Tip {
  id: string;
  amount: number;
  created_at: string;
  customer_name?: string;
  rating?: number;
  review?: string;
}

const WorkerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [tips, setTips] = useState<Tip[]>([]);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({
    totalEarnings: 0,
    tipsToday: 0,
    averageRating: 0,
    totalTips: 0
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchTips();
      generateQRCode();
    }
  }, [userProfile]);

  const fetchTips = async () => {
    try {
      const { data, error } = await supabase
        .from('tips')
        .select('*')
        .eq('worker_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setTips(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching tips:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (tipsData: Tip[]) => {
    const totalEarnings = tipsData.reduce((sum, tip) => sum + tip.amount, 0);
    const today = new Date().toDateString();
    const tipsToday = tipsData.filter(tip => 
      new Date(tip.created_at).toDateString() === today
    ).length;
    const ratingsData = tipsData.filter(tip => tip.rating);
    const averageRating = ratingsData.length > 0 
      ? ratingsData.reduce((sum, tip) => sum + (tip.rating || 0), 0) / ratingsData.length 
      : 0;

    setStats({
      totalEarnings,
      tipsToday,
      averageRating: Number(averageRating.toFixed(1)),
      totalTips: tipsData.length
    });
  };

  const generateQRCode = async () => {
    try {
      const tipUrl = `${window.location.origin}/tip/${userProfile.id}`;
      const qrDataUrl = await QRCode.toDataURL(tipUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const copyQRLink = async () => {
    try {
      const tipUrl = `${window.location.origin}/tip/${userProfile.id}`;
      await navigator.clipboard.writeText(tipUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying link:', error);
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Worker Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userProfile?.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tips Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tipsToday}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tips</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTips}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QR Code Section */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your QR Code</h2>
              {qrCodeUrl && (
                <div className="text-center">
                  <div className="inline-block p-4 bg-gray-50 rounded-lg mb-4">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Customers can scan this code to tip you directly
                  </p>
                  <button
                    onClick={copyQRLink}
                    className="flex items-center justify-center space-x-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Tips */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Recent Tips</h2>
              </div>
              <div className="p-6">
                {tips.length > 0 ? (
                  <div className="space-y-4">
                    {tips.slice(0, 10).map((tip) => (
                      <div key={tip.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{formatCurrency(tip.amount)}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(tip.created_at).toLocaleDateString()} at{' '}
                            {new Date(tip.created_at).toLocaleTimeString()}
                          </p>
                          {tip.customer_name && (
                            <p className="text-sm text-gray-600">From: {tip.customer_name}</p>
                          )}
                        </div>
                        {tip.rating && (
                          <div className="text-right">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-lg ${
                                    i < tip.rating! ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                            {tip.review && (
                              <p className="text-sm text-gray-600 mt-1 max-w-xs truncate">
                                "{tip.review}"
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tips received yet</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Share your QR code with customers to start receiving tips
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerDashboard;