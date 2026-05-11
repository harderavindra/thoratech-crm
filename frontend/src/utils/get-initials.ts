/**
 * Safely derives 1–2 uppercase initials from a full name.
 * Handles leading/trailing spaces, double spaces, and single-word names.
 *
 * getInitials("ravi harde")   → "RH"
 * getInitials("ravi")         → "R"
 * getInitials("  ravi  ")     → "R"
 * getInitials("")             → "?"
 */
export function getInitials(fullName: string): string {
  return (
    fullName
      .trim()
      .split(/\s+/)                        // split on any whitespace run, not just " "
      .filter(Boolean)                     // drop empty strings
      .slice(0, 2)                         // max 2 parts
      .map((n) => n[0]?.toUpperCase() ?? "") // safe — n[0] could be undefined on empty string
      .join("")
    || "?"                                 // fallback if name was all whitespace
  );
}