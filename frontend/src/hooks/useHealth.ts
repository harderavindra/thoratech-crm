import { useQuery } from "@tanstack/react-query";

import { getHealth } from "../services/health.service";

export const useHealth = () => {
  return useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });
};