import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useThreads() {
  return useQuery({
    queryKey: ["threads"],
    queryFn: api.threads,
    staleTime: 1000 * 60 * 10,
  });
}