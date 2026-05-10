export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  TEAM_LEAD: "TEAM_LEAD",
  AGENT: "AGENT",
  QA: "QA",
} as const;

export type UserRole =
  (typeof UserRole)[keyof typeof UserRole];