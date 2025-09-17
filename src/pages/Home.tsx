import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, CreditCard, TrendingUp, Shield, Users, Star } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Digital Tipping
            <span className="text-blue-600 block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Bridge the gap between customers and service workers in the cashless era. 
            Enable seamless, transparent, and direct digital tipping with TIPSY.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all duration-200"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How TIPSY Works</h2>
          <p className="text-xl text-gray-600">Simple, secure, and transparent digital tipping</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Scan QR Code</h3>
            <p className="text-gray-600">
              Each service worker gets a unique QR code. Customers simply scan to access the tipping page.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Digital Payment</h3>
            <p className="text-gray-600">
              Pay tips instantly via UPI, cards, or digital wallets. Money goes directly to the worker.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-6">
              <Star className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Leave Review</h3>
            <p className="text-gray-600">
              Rate the service and leave feedback. Great reviews get promoted automatically.
            </p>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">For Service Workers</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Track earnings and tip history</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Secure direct payments to your account</span>
              </div>
              <div className="flex items-center space-x-3">
                <QrCode className="h-5 w-5 text-purple-600" />
                <span className="text-gray-700">Personal QR code for easy tipping</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">For Business Owners</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-gray-700">Manage all your workers in one place</span>
              </div>
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-gray-700">Analytics and performance insights</span>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-orange-600" />
                <span className="text-gray-700">Automatic review management</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to revolutionize tipping?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of service workers and businesses already using TIPSY
          </p>
          <Link
            to="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Start Your Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;