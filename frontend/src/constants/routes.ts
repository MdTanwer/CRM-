export const ROUTES = {
  ADMIN_DASHBOARD: "/",
  LEADS: "/leads",
  LEADS_UPLOAD: "/leads/upload",
  EMPLOYEES: "/employees",
  SETTINGS: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
