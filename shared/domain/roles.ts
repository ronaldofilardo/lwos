export const APP_ROLES = ["SOCIO", "ANALISTA", "ADMIN", "CLIENTE"] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const TEAM_ROLES = ["SOCIO", "ANALISTA"] as const satisfies readonly AppRole[];

export function isAppRole(value: string): value is AppRole {
  return APP_ROLES.includes(value as AppRole);
}
