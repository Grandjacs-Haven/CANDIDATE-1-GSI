import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';

import useAuth from 'hooks/useAuth';
import { hasScope } from 'utils/scopes';
import { getDefaultPathForRole } from 'utils/roles';

export default function ScopeGuard({ requiredScopes }) {
  const { role, scopes } = useAuth();

  if (!hasScope(scopes, requiredScopes)) {
    return <Navigate to={getDefaultPathForRole(role)} replace />;
  }

  return <Outlet />;
}

ScopeGuard.propTypes = { requiredScopes: PropTypes.arrayOf(PropTypes.string).isRequired };
