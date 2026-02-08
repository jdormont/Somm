import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scanService } from '../services/scanService';
import { ScanSession, ScanRequest } from '../types';

export const QUERY_KEYS = {
  scans: 'scans',
  scan: (id: string) => ['scan', id],
};

export function useScans(userId: string | undefined) {
  return useQuery({
    queryKey: [QUERY_KEYS.scans, userId],
    queryFn: () => scanService.getSessions(userId!),
    enabled: !!userId,
  });
}

export function useScan(id: string | undefined, userId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.scan(id!),
    queryFn: () => scanService.getSessionById(id!, userId!),
    enabled: !!id && !!userId,
  });
}

export function useCreateScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSession: Omit<ScanSession, 'id' | 'created_at'>) => 
      scanService.createSession(newSession),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.scans] });
    },
  });
}

export function useDeleteScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => scanService.deleteSession(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.scans] });
    },
  });
}

export function useAnalyzeWine() {
  return useMutation({
    mutationFn: ({ payload, token }: { payload: ScanRequest; token: string }) => 
      scanService.analyzeWine(payload, token),
  });
}
