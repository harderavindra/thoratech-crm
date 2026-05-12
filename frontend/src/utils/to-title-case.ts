
export function toTitleCase(str: string): string {
  return str.toLowerCase().split(/[_\s-]+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
