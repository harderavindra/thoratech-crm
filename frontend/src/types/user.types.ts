// ─────────────────────────────────────────────────────────────
// Shared user types — import from here everywhere
// ─────────────────────────────────────────────────────────────

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "TEAM_LEAD"
  | "AGENT"
  | "QA";

export type UserStatus = "active" | "inactive";

export interface ApiUser {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  createdBy?: string;
  dateOfJoining?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  passwordChangedAt?: string;
  loginAttempts?: number;
  lockoutUntil?: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedUsers {
  users: ApiUser[];
  pagination: Pagination;
}