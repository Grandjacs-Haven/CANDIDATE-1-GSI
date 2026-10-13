export const USER_ROLES = {
  PATIENT: 'PATIENT',
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  ADMIN: 'ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN'
};

export const ALLOWED_ROLES = [USER_ROLES.PATIENT, USER_ROLES.DOCTOR, USER_ROLES.NURSE, USER_ROLES.ADMIN, USER_ROLES.HOSPITAL_ADMIN];

export function normalizeRole(role) {
  return role;
}

export function resolveAllowedRoles(allowedRoles = ALLOWED_ROLES) {
  return Array.from(new Set(allowedRoles));
}

export const ROLE_ROUTE_BASES = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.DOCTOR]: '/doctor',
  [USER_ROLES.NURSE]: '/nurse',
  [USER_ROLES.HOSPITAL_ADMIN]: '/hospital-admin',
  [USER_ROLES.PATIENT]: '/patient'
};

export const ROLE_APP_IDS = {
  [USER_ROLES.ADMIN]: 'ADMIN_APP',
  [USER_ROLES.DOCTOR]: 'HOSPITAL_APP',
  [USER_ROLES.NURSE]: 'HOSPITAL_APP',
  [USER_ROLES.HOSPITAL_ADMIN]: 'HOSPITAL_APP',
  [USER_ROLES.PATIENT]: 'PATIENT_APP'
};

export const ROLE_DEFAULT_PATHS = {
  [USER_ROLES.ADMIN]: '/admin/lobby',
  [USER_ROLES.DOCTOR]: '/doctor/lobby',
  [USER_ROLES.NURSE]: '/nurse/lobby',
  [USER_ROLES.HOSPITAL_ADMIN]: '/hospital-admin/lobby',
  [USER_ROLES.PATIENT]: '/patient/home'
};

export function getDefaultPathForRole(role) {
  const normalizedRole = normalizeRole(role);
  return ROLE_DEFAULT_PATHS[normalizedRole] || ROLE_DEFAULT_PATHS[USER_ROLES.ADMIN];
}

export function getRouteBaseForRole(role) {
  return ROLE_ROUTE_BASES[normalizeRole(role)] || ROLE_ROUTE_BASES[USER_ROLES.ADMIN];
}

export function getAppIdForRole(role) {
  return ROLE_APP_IDS[normalizeRole(role)] || ROLE_APP_IDS[USER_ROLES.ADMIN];
}

export function getPathForRole(role, path) {
  if (!path || !path.startsWith('/')) return path;
  if (['/login', '/register', '/auth/loading'].includes(path)) return path;

  const normalizedRole = normalizeRole(role);

  if (Object.values(ROLE_ROUTE_BASES).some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return path;
  }

  if (normalizedRole === USER_ROLES.PATIENT) {
    if (path === '/dashboard/default') return '/patient/home';
    if (path === '/profile') return '/patient/profile';
  }

  const prefix = getRouteBaseForRole(normalizedRole);

  if (!prefix) return path;

  return `${prefix}${path}`;
}

export function canAccessRole(role, allowedRoles = ALLOWED_ROLES) {
  const normalizedRole = normalizeRole(role);
  return Boolean(normalizedRole && resolveAllowedRoles(allowedRoles).includes(normalizedRole));
}

export function roleMatches(role, allowedRoles = ALLOWED_ROLES) {
  return canAccessRole(role, Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]);
}

export const LOGIN_ROLE_OPTIONS = [
  { value: USER_ROLES.ADMIN, label: 'System Admin', description: 'Platform administration and oversight access', app: 'ADMIN_APP' },
  { value: USER_ROLES.HOSPITAL_ADMIN, label: 'Hospital Admin', description: 'Hospital operations and staff access', app: 'HOSPITAL_APP' },
  { value: USER_ROLES.DOCTOR, label: 'Doctor', description: 'Clinical review and care workflow access', app: 'HOSPITAL_APP' },
  { value: USER_ROLES.NURSE, label: 'Nurse', description: 'Care team operational access', app: 'HOSPITAL_APP' },
  { value: USER_ROLES.PATIENT, label: 'Patient', description: 'Patient portal access', app: 'PATIENT_APP' }
];

export function getLoginOptionByRole(role) {
  const normalizedRole = normalizeRole(role);
  return LOGIN_ROLE_OPTIONS.find((option) => option.value === normalizedRole) || null;
}
