import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, TrendingUp, Star, Plus, DollarSign } from 'lucide-react';

interface Worker {
  id: string;
  name: string;
  email: string;
  upi_id: string;
  created_at: string;
  total_earnings: number;
  total_tips: number;
  average_rating: number;
}

const OwnerDashboard: React.FC = () => {
  const { userProfile } = useAuth();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorkerEmail, setNewWorkerEmail] = useState('');
  const [stats, setStats] = useState({
    totalWorkers: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalTips: 0
  });

  useEffect(() => {
    if (userProfile?.id) {
      fetchWorkers();
    }
  }, [userProfile]);

  const fetchWorkers = async () => {
    try {
      // First get workers associated with this business
      const { data: businessWorkers, error: businessError } = await supabase
        .from('business_workers')
        .select('worker_id')
        .eq('owner_id', userProfile.id);

      if (businessError) throw businessError;

      if (businessWorkers && businessWorkers.length > 0) {
        const workerIds = businessWorkers.map(bw => bw.worker_id);
        
        // Get worker profiles with aggregated tip data
        const { data: workersData, error: workersError } = await supabase
          .from('user_profiles')
          .select(`
            id,
            name,
            email,
            upi_id,
            created_at
          `)
          .in('id', workerIds)
          .eq('role', 'worker');

        if (workersError) throw workersError;

        // Get tip statistics for each worker
        const workersWithStats = await Promise.all(
          (workersData || []).map(async (worker) => {
            const { data: tips } = await supabase
              .from('tips')
              .select('amount, rating')
              .eq('worker_id', worker.id);

            const totalEarnings = tips?.reduce((sum, tip) => sum + tip.amount, 0) || 0;
            const totalTips = tips?.length || 0;
            const ratingsData = tips?.filter(tip => tip.rating) || [];
            const averageRating = ratingsData.length > 0 
              ? ratingsData.reduce((sum, tip) => sum + tip.rating, 0) / ratingsData.length 
              : 0;

            return {
              ...worker,
              total_earnings: totalEarnings,
              total_tips: totalTips,
              average_rating: Number(averageRating.toFixed(1))
            };
          })
        );

        setWorkers(workersWithStats);
        calculateStats(workersWithStats);
      }
    } catch (error) {
      console.error('Error fetching workers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (workersData: Worker[]) => {
    const totalWorkers = workersData.length;
    const totalEarnings = workersData.reduce((sum, worker) => sum + worker.total_earnings, 0);
    const totalTips = workersData.reduce((sum, worker) => sum + worker.total_tips, 0);
    const ratingsData = workersData.filter(worker => worker.average_rating > 0);
    const averageRating = ratingsData.length > 0 
      ? ratingsData.reduce((sum, worker) => sum + worker.average_rating, 0) / ratingsData.length 
      : 0;

    setStats({
      totalWorkers,
      totalEarnings,
      totalTips,
      averageRating: Number(averageRating.toFixed(1))
    });
  };

  const addWorkerToBusiness = async () => {
    if (!newWorkerEmail.trim()) return;

    try {
      // Find the worker by email
      const { data: worker, error: findError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', newWorkerEmail)
        .eq('role', 'worker')
        .single();

      if (findError) {
        alert('Worker not found. Please make sure they have registered as a worker.');
        return;
      }

      // Add to business_workers table
      const { error: addError } = await supabase
        .from('business_workers')
        .insert({
          owner_id: userProfile.id,
          worker_id: worker.id
        });

      if (addError) {
        if (addError.code === '23505') {
          alert('This worker is already part of your business.');
        } else {
          throw addError;
        }
        return;
      }

      setNewWorkerEmail('');
      setShowAddWorker(false);
      fetchWorkers(); // Refresh the list
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Failed to add worker to your business.');
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
            <p className="text-gray-600">
              {userProfile?.business_name} - Manage your workers and track performance
            </p>
          </div>
          <button
            onClick={() => setShowAddWorker(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Worker</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Workers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalWorkers}</p>
              </div>
            </div>
          </div>

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
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="h-6 w-6 text-purple-600" />
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

        {/* Workers Table */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Workers Performance</h2>
          </div>
          <div className="overflow-x-auto">
            {workers.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Worker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Earnings
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Tips
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Average Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {workers
                    .sort((a, b) => b.total_earnings - a.total_earnings)
                    .map((worker, index) => (
                    <tr key={worker.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                #{index + 1}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {worker.name}
                              </div>
                              <div className="text-sm text-gray-500">{worker.email}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(worker.total_earnings)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{worker.total_tips}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm text-gray-900">
                            {worker.average_rating || 'N/A'}
                          </div>
                          {worker.average_rating > 0 && (
                            <Star className="ml-1 h-4 w-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(worker.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No workers added yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Add workers to your business to start tracking their performance
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Add Worker Modal */}
        {showAddWorker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Worker to Business</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Worker Email Address
                </label>
                <input
                  type="email"
                  value={newWorkerEmail}
                  onChange={(e) => setNewWorkerEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="worker@example.com"
                />
                <p className="text-sm text-gray-500 mt-2">
                  The worker must already be registered on TIPSY
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={addWorkerToBusiness}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Add Worker
                </button>
                <button
                  onClick={() => {
                    setShowAddWorker(false);
                    setNewWorkerEmail('');
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;