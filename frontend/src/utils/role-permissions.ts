import type { UserRole } from "../types/user.types";

// Single source of truth for role-based creation permissions on the frontend.
// Mirrors the backend ROLE_PERMISSIONS map in user.controller.ts.
export const CREATABLE_ROLES: Record<string, UserRole[]> = {
  SUPER_ADMIN: ["SUPER_ADMIN", "ADMIN", "TEAM_LEAD", "AGENT", "QA"],
  ADMIN:       ["TEAM_LEAD", "AGENT", "QA"],
  TEAM_LEAD:   ["AGENT", "QA"],
};

export const getCreatableRoles = (actorRole: string): UserRole[] =>
  CREATABLE_ROLES[actorRole] ?? [];
