import { getAppIdForRole, USER_ROLES } from './roles';

const AUTH_STORAGE_KEY = 'shan-alert-auth-session';

function readStoredSession() {
  if (typeof window === 'undefined') return null;

  try {
    const storedSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

    return storedSession ? JSON.parse(storedSession) : null;
  } catch {
    return null;
  }
}

export function getAppIdForPath(path, fallbackRole = USER_ROLES.ADMIN) {
  if (!path) return getAppIdForRole(fallbackRole);

  const normalizedPath = String(path).replace(/^\/free(?=\/|$)/, '');

  if (normalizedPath === '/patient' || normalizedPath.startsWith('/patient/')) return getAppIdForRole(USER_ROLES.PATIENT);
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) return getAppIdForRole(USER_ROLES.ADMIN);
  if (normalizedPath === '/doctor' || normalizedPath.startsWith('/doctor/')) return getAppIdForRole(USER_ROLES.DOCTOR);
  if (normalizedPath === '/nurse' || normalizedPath.startsWith('/nurse/')) return getAppIdForRole(USER_ROLES.NURSE);
  if (normalizedPath === '/hospital-admin' || normalizedPath.startsWith('/hospital-admin/')) {
    return getAppIdForRole(USER_ROLES.HOSPITAL_ADMIN);
  }

  return getAppIdForRole(fallbackRole);
}

export function getCurrentAppHeaderValue(fallbackRole = USER_ROLES.ADMIN) {
  const session = readStoredSession();

  if (session?.appType || session?.appName) {
    return session.appType || session.appName;
  }

  if (typeof window !== 'undefined') {
    return getAppIdForPath(window.location.pathname, fallbackRole);
  }

  return getAppIdForRole(session?.role || fallbackRole);
}
