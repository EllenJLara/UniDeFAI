import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const useApprovalStatus = (userId?: string) => {
  return useQuery({
    queryKey: ['approval-status', userId],
    queryFn: async () => {
      const { data } = await axios.get('/api/approved');
      return data.approved;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};