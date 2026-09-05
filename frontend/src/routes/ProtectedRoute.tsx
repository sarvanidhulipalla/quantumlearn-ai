import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types/auth';
import LoadingState from '../components/common/LoadingState';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState fullScreen message="Authenticating quantum session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role) && user.role !== 'Admin') {
    // Redirect to their appropriate home if unauthorized for this role
    if (user.role === 'Instructor') {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
