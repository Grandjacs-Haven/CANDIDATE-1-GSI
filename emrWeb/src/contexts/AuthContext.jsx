import PropTypes from 'prop-types';
import { createContext, useCallback, useEffect, useMemo, useState } from 'react';

import { API_BASE_URL, APP_HEADER_KEY, LOGIN_ENDPOINT } from 'config';
import { ALLOWED_ROLES, getAppIdForRole, getLoginOptionByRole, normalizeRole } from 'utils/roles';
import { AUTH_SCOPES_KEY, normalizeScopes } from 'utils/scopes';

export const AUTH_STORAGE_KEY = 'shan-alert-auth-session';
export const AUTH_TOKEN_KEY = 'token';
export const AUTH_USER_ID_KEY = 'userId';
export const AUTH_ROLE_KEY = 'role';
export const AUTH_EXPIRES_IN_KEY = 'expiresIn';
export const AUTH_APP_TYPE_KEY = 'appType';

const initialState = {
  token: null,
  userId: null,
  role: null,
  expiresIn: null,
  appType: null,
  scopes: []
};

const AUTH_LOGOUT_REASON_KEY = 'shan-alert-logout-reason';

const AuthContext = createContext({
  ...initialState,
  allowedRoles: ALLOWED_ROLES,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {}
});

function getStoredSession() {
  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedSession) {
      return initialState;
    }

    const session = JSON.parse(storedSession);

    if (!session?.token || !session?.userId || !session?.expiresIn || Number(session.expiresIn) <= Date.now()) {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      return initialState;
    }

    return session;
  } catch (error) {
    console.warn('Unable to read auth session:', error);
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return initialState;
  }
}

function persistSession(session) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

function clearSession() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function writeLogoutReason(reason) {
  if (!reason) return;
  window.sessionStorage.setItem(AUTH_LOGOUT_REASON_KEY, reason);
}

export function readLogoutReason() {
  return window.sessionStorage.getItem(AUTH_LOGOUT_REASON_KEY);
}

export function clearLogoutReason() {
  window.sessionStorage.removeItem(AUTH_LOGOUT_REASON_KEY);
}

function getLoginPath() {
  const baseName = import.meta.env.VITE_APP_BASE_NAME || '';
  const normalizedBase = baseName.endsWith('/') ? baseName.slice(0, -1) : baseName;
  return `${normalizedBase}/login`;
}

function redirectToLogin(reason) {
  writeLogoutReason(reason);
  window.location.replace(`${getLoginPath()}?reason=${encodeURIComponent(reason)}`);
}

function normalizeExpiresIn(expiresIn) {
  const rawValue = Number(expiresIn);

  if (!Number.isFinite(rawValue) || rawValue <= 0) {
    return null;
  }

  if (rawValue >= 1_000_000_000_000) {
    return rawValue;
  }

  if (rawValue >= 1_000_000_000) {
    return rawValue * 1000;
  }

  return Date.now() + rawValue * 1000;
}


function normalizeLoginResponse(response) {
  const role = normalizeRole(response?.role);

  return {
    token: response?.token,
    userId: response?.userId ?? response?.id,
    role,
    // Backend returns an absolute Unix timestamp in milliseconds.
    expiresIn: normalizeExpiresIn(response?.expiresAt ?? response?.expiresIn),
    appType: response?.appType || response?.appName || getAppIdForRole(role) || 'ADMIN_APP',
    scopes: normalizeScopes(response?.scopes ?? response?.scope ?? response?.authorities ?? response?.privileges)
  };
}


function getLoginUrl(appType) {
  const params = new URLSearchParams({ app: appType || 'ADMIN_APP' });
  return `${API_BASE_URL}${LOGIN_ENDPOINT}?${params.toString()}`;
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(getStoredSession);

  const logout = useCallback((reason) => {
    if (reason) {
      writeLogoutReason(reason);
    }
    clearSession();
    setSession(initialState);
  }, []);

  const login = useCallback(async ({ email, password, appType, selectedRole }) => {
    const normalizedSelectedRole = normalizeRole(selectedRole);
    const selectedLoginOption = getLoginOptionByRole(normalizedSelectedRole);
    const resolvedAppType = appType || selectedLoginOption?.app || 'ADMIN_APP';

    const response = await fetch(getLoginUrl(resolvedAppType), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [APP_HEADER_KEY]: resolvedAppType
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data?.message || 'Login failed. Please check your credentials and try again.');
    }

    const nextSession = normalizeLoginResponse(data);
    const responseLoginOption = getLoginOptionByRole(nextSession.role);

    if (!nextSession.token || !nextSession.userId || !nextSession.expiresIn) {
      throw new Error('Login response is missing required session fields.');
    }

    if (nextSession.expiresIn <= Date.now()) {
      throw new Error('Your login session has already expired. Please sign in again.');
    }

    if (normalizedSelectedRole && nextSession.role && nextSession.role !== normalizedSelectedRole) {
      throw new Error(`This account is signed in as ${nextSession.role}. Please select the correct role and try again.`);
    }

    if (normalizedSelectedRole && nextSession.role && responseLoginOption?.app && responseLoginOption.app !== resolvedAppType) {
      throw new Error('This account is not allowed into the selected app. Please choose the correct sign-in option.');
    }

    clearLogoutReason();
    persistSession(nextSession);
    setSession(nextSession);

    return nextSession;
  }, []);

  useEffect(() => {
    if (!session.expiresIn) {
      return undefined;
    }

    const expiresInMs = Number(session.expiresIn) - Date.now();

    if (expiresInMs <= 0) {
      logout('session-expired');
      redirectToLogin('session-expired');
      return undefined;
    }

    const logoutTimer = window.setTimeout(() => {
      logout('session-expired');
      redirectToLogin('session-expired');
    }, expiresInMs);

    return () => window.clearTimeout(logoutTimer);
  }, [logout, session.expiresIn]);

  const value = useMemo(
    () => ({
      ...session,
      allowedRoles: ALLOWED_ROLES,
      isAuthenticated: Boolean(session.token && session.userId && session.expiresIn),
      login,
      logout
    }),
    [login, logout, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = { children: PropTypes.node };

export default AuthContext;
