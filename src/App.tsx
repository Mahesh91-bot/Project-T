import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import WorkerDashboard from './pages/WorkerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import TipPage from './pages/TipPage';
import ReviewPage from './pages/ReviewPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route 
              path="/worker-dashboard" 
              element={
                <ProtectedRoute requiredRole="worker">
                  <WorkerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/owner-dashboard" 
              element={
                <ProtectedRoute requiredRole="owner">
                  <OwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/tip/:workerId" element={<TipPage />} />
            <Route path="/review/:workerId" element={<ReviewPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;