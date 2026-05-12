import type { AvatarColor } from "../components/ui/avatar";

const COLORS: AvatarColor[] = ["rose", "blue", "purple", "teal", "green", "amber", "coral"];

export const avatarColorFromId = (id: string): AvatarColor => {
  const sum = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return COLORS[sum % COLORS.length];
};
