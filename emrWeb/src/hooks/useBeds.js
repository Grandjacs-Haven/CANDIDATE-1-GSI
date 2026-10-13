import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller, Entity & DTOs)
// ============================================================================

export type BedStatus = 
  | 'OCCUPIED' 
  | 'RESERVED' 
  | 'MAINTENANCE' 
  | 'CLEANING' 
  | 'OUT_OF_SERVICE';

export interface RoomSummaryDto {
  id: string; // UUID
  roomNumber: string;
  roomType?: string;
  status?: string;
  ward?: {
    id: string;
    code: string;
    name: string;
  };
}

export interface BedRequestDto {
  bedNumber: string;
  bedStatus: BedStatus;
  description?: string | null;
}

export interface BedUpdateDto {
  bedNumber?: string | null;
  bedStatus?: BedStatus | null;
  description?: string | null;
}

export interface BedResponseDto {
  id: string; // UUID
  room: RoomSummaryDto;
  bedNumber: string;
  bedStatus: BedStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const BEDS_QUERY_KEY = 'beds';

interface UseBedsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all beds.
 * Endpoint: GET /api/v1/beds
 */
export function useBeds(params?: UseBedsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<BedResponseDto[] | { content: BedResponseDto[]; totalElements: number }, Error>({
    queryKey: [BEDS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<BedResponseDto[] | { content: BedResponseDto[]; totalElements: number }>(
        '/api/v1/beds',
        { params }
      );
      return response.data;
    }
  });

  const beds = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    beds,
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
 * Hook to fetch beds by room ID.
 * Endpoint: GET /api/v1/beds/rooms/{roomId}
 */
export function useBedsByRoom(roomId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<BedResponseDto[], Error>({
    queryKey: [BEDS_QUERY_KEY, 'room', roomId],
    queryFn: async () => {
      if (!roomId) return [];
      const response = await axiosServices.get<BedResponseDto[]>(
        `/api/v1/beds/rooms/${roomId}`
      );
      return response.data;
    },
    enabled: Boolean(roomId)
  });

  return {
    beds: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch a single bed by ID.
 * Endpoint: GET /api/v1/beds/{id}
 */
export function useBed(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<BedResponseDto | null, Error>({
    queryKey: [BEDS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<BedResponseDto>(
        `/api/v1/beds/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    bed: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new bed under a specific room.
 * Endpoint: POST /api/v1/beds/rooms/{roomId}
 */
export function useCreateBed() {
  const queryClient = useQueryClient();

  return useMutation<BedResponseDto, Error, { roomId: string; payload: BedRequestDto; actorId: string }>({
    mutationFn: async ({ roomId, payload, actorId }) => {
      const response = await axiosServices.post<BedResponseDto>(
        `/api/v1/beds/rooms/${roomId}`,
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
      queryClient.invalidateQueries({ queryKey: [BEDS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing bed (using BedUpdateDto and optional room reassignment).
 * Endpoint: PUT /api/v1/beds/{id}/rooms/{roomId}
 */
export function useUpdateBed() {
  const queryClient = useQueryClient();

  return useMutation<BedResponseDto, Error, { id: string; roomId: string; payload: BedUpdateDto; actorId: string }>({
    mutationFn: async ({ id, roomId, payload, actorId }) => {
      const response = await axiosServices.put<BedResponseDto>(
        `/api/v1/beds/${id}/rooms/${roomId}`,
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
      queryClient.invalidateQueries({ queryKey: [BEDS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a bed.
 * Endpoint: DELETE /api/v1/beds/{id}
 */
export function useDeleteBed() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/beds/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BEDS_QUERY_KEY] });
    }
  });
}