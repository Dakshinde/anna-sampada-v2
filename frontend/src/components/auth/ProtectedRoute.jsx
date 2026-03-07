import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // Or your own loading spinner

const ProtectedRoute = () => {
  // We need to check 'user' and 'loading' state from your AuthContext
  // I am assuming your context has a 'loading' state
  const { user, loading } = useAuth(); 

  if (loading) {
    // Show a full-page spinner while AuthContext is checking
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-12 h-12" />
      </div>
    );
  }

  // If loading is done and there is NO user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If loading is done AND there IS a user, show the component
  // (e.g., <UserDashboard />)
  return <Outlet />;
};

export default ProtectedRoute;