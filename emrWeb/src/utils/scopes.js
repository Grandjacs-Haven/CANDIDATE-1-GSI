export const AUTH_SCOPES_KEY = 'scopes';
export const ADMIN_SCOPE = 'admin';

export function normalizeScopes(value) {
  if (!value) return [];

  const rawScopes = Array.isArray(value)
    ? value.map((scope) => scope?.authority || scope?.scope || scope?.name || scope?.privilege || scope)
    : String(value)
        .split(/[,\s]+/)
        .filter(Boolean);

  return Array.from(
    new Set(
      rawScopes
        .map((scope) => String(scope).trim().toLowerCase().replace(/^scope_/, ''))
        .filter(Boolean)
    )
  );
}

export function hasScope(userScopes = [], requiredScopes = []) {
  const normalizedUserScopes = normalizeScopes(userScopes);
  const normalizedRequiredScopes = normalizeScopes(requiredScopes);

  if (normalizedUserScopes.includes(ADMIN_SCOPE)) return true;
  if (!normalizedRequiredScopes.length) return true;

  return normalizedRequiredScopes.some((scope) => normalizedUserScopes.includes(scope));
}

export function hasAllScopes(userScopes = [], requiredScopes = []) {
  const normalizedUserScopes = normalizeScopes(userScopes);
  const normalizedRequiredScopes = normalizeScopes(requiredScopes);

  if (normalizedUserScopes.includes(ADMIN_SCOPE)) return true;
  if (!normalizedRequiredScopes.length) return true;

  return normalizedRequiredScopes.every((scope) => normalizedUserScopes.includes(scope));
}
