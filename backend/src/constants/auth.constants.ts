export const PASSWORD_COMPLEXITY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{10,}$/;
export const LOCKOUT_DURATION_MS =
  15 * 60 * 1000;

export const MAX_ATTEMPTS =
  5;

export const COOKIE_MAX_AGE_MS =
  30 * 60 * 1000;