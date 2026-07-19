/**
 * Centralized API endpoint constants.
 * All API paths live here — never hardcode strings in feature files.
 * Source of truth: api-docs.json, server base: http://localhost:3000/api/v1
 */

export const ENDPOINTS = {
  // ─── Auth ──────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  // ─── Users ─────────────────────────────────────────────────────────────────
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    PROFILE: '/users/profile',
    BAN: (id: string) => `/users/${id}/ban`,
    UNBAN: (id: string) => `/users/${id}/unban`,
  },

  // ─── Warehouses ────────────────────────────────────────────────────────────
  WAREHOUSES: {
    BASE: '/warehouses',
    BY_ID: (id: string) => `/warehouses/${id}`,
  },

  // ─── Packages ──────────────────────────────────────────────────────────────
  PACKAGES: {
    BASE: '/packages',
    BY_ID: (id: string) => `/packages/${id}`,
  },

  // ─── Dashboard ─────────────────────────────────────────────────────────────
  DASHBOARD: {
    FINANCIAL_REPORT: '/dashboard/financial-report',
    PACKAGE_STATUS_REPORT: '/dashboard/package-status-report',
  },
} as const
