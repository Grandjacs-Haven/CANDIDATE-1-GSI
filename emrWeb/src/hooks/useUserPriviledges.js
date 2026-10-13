import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & DTOs (Matching Backend Controller & DTOs)
// ============================================================================

export interface PrivilegeOption {
  name: string;
  displayName: string;
  description?: string;
  scope?: string;
}

export interface UserPrivilegeResponseDto {
  id: string; // UUID
  userId: string; // UUID
  privilegeName: string;
  scope?: string;
}

export interface PrivilegeAssignmentDto {
  privilegeNames: string[]; // or Set<string> represented as array in JS/TS
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const PRIVILEGES_QUERY_KEY = 'user-privileges';

/**
 * Hook to fetch all available system privileges that can be assigned.
 * Endpoint: GET /api/v1/user-priviledge/privileges/available
 */
export function useAvailablePrivileges() {
  const { data, isLoading, isError, error, refetch } = useQuery<PrivilegeOption[], Error>({
    queryKey: [PRIVILEGES_QUERY_KEY, 'available'],
    queryFn: async () => {
      const response = await axiosServices.get<PrivilegeOption[]>(
        '/api/v1/user-priviledge/privileges/available'
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 10 // Cache available options for 10 minutes
  });

  return {
    availablePrivileges: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch all privileges assigned to a specific user.
 * Endpoint: GET /api/v1/user-priviledge/{userId}/privileges
 */
export function useUserPrivileges(userId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<UserPrivilegeResponseDto[], Error>({
    queryKey: [PRIVILEGES_QUERY_KEY, 'user', userId],
    queryFn: async () => {
      if (!userId) return [];
      const response = await axiosServices.get<UserPrivilegeResponseDto[]>(
        `/api/v1/user-priviledge/${userId}/privileges`
      );
      return response.data;
    },
    enabled: Boolean(userId)
  });

  return {
    userPrivileges: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to attach/assign one or more privileges to a user.
 * Endpoint: POST /api/v1/user-priviledge/{userId}/privileges
 */
export function useAttachPrivileges() {
  const queryClient = useQueryClient();

  return useMutation<UserPrivilegeResponseDto[], Error, { userId: string; payload: PrivilegeAssignmentDto; actorId: string }>({
    mutationFn: async ({ userId, payload, actorId }) => {
      const response = await axiosServices.post<UserPrivilegeResponseDto[]>(
        `/api/v1/user-priviledge/${userId}/privileges`,
        payload,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PRIVILEGES_QUERY_KEY, 'user', variables.userId]
      });
    }
  });
}

/**
 * Hook to remove a specific privilege from a user by its privilege name.
 * Endpoint: DELETE /api/v1/user-priviledge/{userId}/privileges/{privilegeName}
 */
export function useRemovePrivilege() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string; privilegeName: string; actorId: string }>({
    mutationFn: async ({ userId, privilegeName, actorId }) => {
      await axiosServices.delete(
        `/api/v1/user-priviledge/${userId}/privileges/${encodeURIComponent(privilegeName)}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PRIVILEGES_QUERY_KEY, 'user', variables.userId]
      });
    }
  });
}

/**
 * Hook to remove all privileges assigned to a user.
 * Endpoint: DELETE /api/v1/user-priviledge/{userId}/privileges
 */
export function useRemoveAllPrivileges() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { userId: string; actorId: string }>({
    mutationFn: async ({ userId, actorId }) => {
      await axiosServices.delete(
        `/api/v1/user-priviledge/${userId}/privileges`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PRIVILEGES_QUERY_KEY, 'user', variables.userId]
      });
    }
  });
}