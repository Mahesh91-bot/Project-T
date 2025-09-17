import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, CheckCircle, MessageSquare, User } from 'lucide-react';

interface WorkerData {
  id: string;
  name: string;
  email: string;
}

const ReviewPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const tipAmount = searchParams.get('amount');
  const customerName = searchParams.get('customer');

  const quickReviews = [
    'Excellent service!',
    'Very polite and helpful',
    'Quick and efficient',
    'Went above and beyond',
    'Professional attitude',
    'Made my day better'
  ];

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

  const handleSubmitReview = async () => {
    if (!worker || rating === 0) return;

    setSubmitting(true);
    try {
      // Update the tip record with rating and review
      const { error } = await supabase
        .from('tips')
        .update({
          rating,
          review: review.trim() || null
        })
        .eq('worker_id', worker.id)
        .eq('customer_name', customerName || 'Anonymous')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) throw error;

      // Simulate Google Maps API call for high ratings
      if (rating >= 4) {
        console.log('Simulating Google Maps review posting for rating:', rating);
        // In a real app, this would call the Google Maps API
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setSubmitted(true);
      setTimeout(() => navigate('/'), 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(Number(amount));
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
          <p className="text-gray-600">Unable to load review page.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h1>
            <p className="text-gray-600 mb-4">
              Your tip of {tipAmount && formatCurrency(tipAmount)} has been sent to {worker.name}
            </p>
            <p className="text-gray-600 mb-6">
              {rating >= 4 
                ? 'Your positive review will be shared publicly to help promote great service!'
                : 'Your feedback has been recorded and will help improve service quality.'
              }
            </p>
            <div className="text-sm text-gray-500">
              Redirecting to homepage in 3 seconds...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 py-8">
      <div className="max-w-md mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">
              {tipAmount && `${formatCurrency(tipAmount)} sent to ${worker.name}`}
            </p>
          </div>

          {/* Rating Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              How was your service experience?
            </h2>
            <div className="flex justify-center space-x-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-4xl transition-colors ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  } hover:text-yellow-400`}
                >
                  ★
                </button>
              ))}
            </div>
            <p className="text-center text-sm text-gray-600">
              {rating === 0 && 'Tap to rate your experience'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          {/* Quick Review Options */}
          {rating > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Quick feedback (optional)
              </h3>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickReviews.map((quickReview) => (
                  <button
                    key={quickReview}
                    onClick={() => setReview(quickReview)}
                    className={`p-2 text-sm rounded-lg border transition-all ${
                      review === quickReview
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {quickReview}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom Review */}
          {rating > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="inline h-4 w-4 mr-1" />
                Write a review (optional)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Share your experience..."
                maxLength={200}
              />
              <div className="text-right text-xs text-gray-500 mt-1">
                {review.length}/200 characters
              </div>
            </div>
          )}

          {/* Privacy Notice */}
          {rating >= 4 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <Star className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    Great Rating!
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Ratings of 4+ stars may be shared publicly to help promote excellent service.
                  </p>
                </div>
              </div>
            </div>
          )}

          {rating > 0 && rating <= 3 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-2">
                <MessageSquare className="h-5 w-5 text-gray-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Private Feedback
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    This feedback will be kept private and used to improve service quality.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitReview}
            disabled={rating === 0 || submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-green-600 text-white py-4 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </div>
            ) : rating === 0 ? (
              'Please rate your experience'
            ) : (
              'Submit Review'
            )}
          </button>

          {/* Skip Option */}
          <button
            onClick={() => navigate('/')}
            className="w-full mt-4 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Skip review and continue
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPage;