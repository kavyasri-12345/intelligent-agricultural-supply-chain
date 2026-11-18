import { User } from './types';

export const TOKEN_KEY = 'agri_jwt_token';
export const USER_KEY = 'agri_user';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setSession(token: string, user: User): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getRoleDashboard(role?: string): string {
  const norm = (role || '').toUpperCase();
  switch (norm) {
    case 'FARMER':
      return '/farmer-dashboard';
    case 'DISTRIBUTOR':
    case 'TRANSPORT_MANAGER':
    case 'STORAGE_MANAGER':
      return '/distributor-dashboard';
    case 'RETAILER':
      return '/retailer-dashboard';
    case 'ADMIN':
    case 'PLANNER':
    default:
      return '/admin-dashboard';
  }
}

export function isRoleAuthorizedForDashboard(userRole: string | undefined, dashboardPath: string): boolean {
  if (!userRole) return false;
  const role = userRole.toUpperCase();
  if (role === 'ADMIN' || role === 'PLANNER') return true;

  if (dashboardPath.includes('farmer-dashboard')) {
    return role === 'FARMER';
  }
  if (dashboardPath.includes('distributor-dashboard')) {
    return role === 'DISTRIBUTOR' || role === 'TRANSPORT_MANAGER' || role === 'STORAGE_MANAGER';
  }
  if (dashboardPath.includes('retailer-dashboard')) {
    return role === 'RETAILER';
  }
  if (dashboardPath.includes('admin-dashboard')) {
    return role === 'ADMIN' || role === 'PLANNER';
  }

  return true;
}
