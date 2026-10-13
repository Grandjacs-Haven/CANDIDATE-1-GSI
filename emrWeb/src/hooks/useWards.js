import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type WardType = 
  | 'GENERAL' 
  | 'ICU' 
  | 'EMERGENCY' 
  | 'PEDIATRIC' 
  | 'MATERNITY' 
  | 'SURGICAL' 
  | 'PRIVATE';

export type WardStatus = 
  | 'ACTIVE' 
  | 'INACTIVE' 
  | 'MAINTENANCE' 
  | 'CLOSED';

export interface WardRequestDto {
  code: string;
  name: string;
  wardType: WardType;
  status: WardStatus;
  description?: string | null;
}

export interface WardUpdateDto {
  code?: string | null;
  name?: string | null;
  wardType?: WardType | null;
  status?: WardStatus | null;
  description?: string | null;
}

export interface WardResponseDto {
  id: string; // UUID
  code: string;
  name: string;
  wardType: WardType;
  status: WardStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const WARDS_QUERY_KEY = 'wards';

interface UseWardsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all wards.
 * Endpoint: GET /api/v1/wards
 */
export function useWards(params?: UseWardsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<WardResponseDto[] | { content: WardResponseDto[]; totalElements: number }, Error>({
    queryKey: [WARDS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<WardResponseDto[] | { content: WardResponseDto[]; totalElements: number }>(
        '/api/v1/wards',
        { params }
      );
      return response.data;
    }
  });

  const wards = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    wards,
    totalElements,
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  };
}

/**
 * Hook to fetch a single ward by ID.
 * Endpoint: GET /api/v1/wards/{id}
 */
export function useWard(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<WardResponseDto | null, Error>({
    queryKey: [WARDS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<WardResponseDto>(
        `/api/v1/wards/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    ward: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new ward.
 * Endpoint: POST /api/v1/wards
 */
export function useCreateWard() {
  const queryClient = useQueryClient();

  return useMutation<WardResponseDto, Error, { payload: WardRequestDto; actorId: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const response = await axiosServices.post<WardResponseDto>(
        '/api/v1/wards',
        payload,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WARDS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing ward via PUT.
 * Endpoint: PUT /api/v1/wards/{id}
 */
export function useUpdateWard() {
  const queryClient = useQueryClient();

  return useMutation<WardResponseDto, Error, { id: string; payload: WardUpdateDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<WardResponseDto>(
        `/api/v1/wards/${id}`,
        payload,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WARDS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a ward.
 * Endpoint: DELETE /api/v1/wards/{id}
 */
export function useDeleteWard() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/wards/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [WARDS_QUERY_KEY] });
    }
  });
}