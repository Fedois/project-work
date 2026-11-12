import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserRole = 'MEMBER' | 'LIBRARIAN' | 'ADMIN';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
  unauthorizedRedirect?: string;
}

export default function ProtectedRoute({ allowedRoles, unauthorizedRedirect = '/' }: ProtectedRouteProps = {}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <></>;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user.role ?? 'MEMBER';
    if (!allowedRoles.includes(userRole as UserRole)) {
      return <Navigate to={unauthorizedRedirect} replace />;
    }
  }

  return <Outlet />;
}
