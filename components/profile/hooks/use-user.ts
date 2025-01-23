import { useQuery } from "@tanstack/react-query";
import { IUser } from "../types";
import { getUser } from "../api/get-user";
import { useSession } from "next-auth/react";

export const useUser = ({
  id,
  initialData,
  enabled = true
}: {
  id: string | undefined;
  initialData?: IUser;
  enabled?: boolean;
}) => {
  const { data: session } = useSession();

  return useQuery<IUser>({
    queryKey: ['users', id],
    queryFn: async () => {
      try {
        const data = await getUser(id);
        return data;
      } catch (error) {
        console.error('Error fetching user:', error);
        throw error;
      }
    },
    enabled: enabled && !!id && !!session,
    refetchOnWindowFocus: false,
    initialData,
    retry: 1,
    staleTime: 30000,
    onError: (error) => {
      console.error('Query error:', error);
    }
  });
};