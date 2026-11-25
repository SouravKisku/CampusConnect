import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import type { Meta } from "./types";

export const useMeta = () =>
  useQuery({
    queryKey: ["meta"],
    queryFn: async () => (await api.get<Meta>("/meta")).data,
    staleTime: Infinity,
  });
