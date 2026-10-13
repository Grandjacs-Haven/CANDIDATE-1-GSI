import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from 'hooks/useAuth';

export default function AuthGuard({ requiredScopes = [] }) {
  const { isAuthenticated, scopes = [] } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const hasRequiredScopes = requiredScopes.every((scope) => scopes.includes(scope));

  if (!hasRequiredScopes) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
