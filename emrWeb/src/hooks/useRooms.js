import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller, Entity & DTOs)
// ============================================================================

export type RoomType = 
  | 'GENERAL_WARD' 
  | 'PRIVATE' 
  | 'SEMIPRIVATE' 
  | 'ICU' 
  | 'ISOLATION' 
  | 'EMERGENCY' 
  | 'OPERATING_THEATER';

export type RoomStatus = 
  | 'AVAILABLE' 
  | 'OCCUPIED' 
  | 'RESERVED' 
  | 'MAINTENANCE' 
  | 'CLEANING' 
  | 'OUT_OF_SERVICE';

export interface WardSummaryDto {
  id: string; // UUID
  code: string;
  name: string;
  wardType?: string;
  status?: string;
}

export interface RoomRequestDto {
  roomNumber: string;
  roomType: RoomType;
  capacity?: number;
  status?: RoomStatus;
  description?: string | null;
}

export interface RoomUpdateDto {
  roomNumber?: string | null;
  roomType?: RoomType | null;
  capacity?: number | null;
  status?: RoomStatus | null;
  description?: string | null;
}

export interface RoomResponseDto {
  id: string; // UUID
  ward: WardSummaryDto;
  roomNumber: string;
  roomType: RoomType;
  capacity: number;
  status: RoomStatus;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const ROOMS_QUERY_KEY = 'rooms';

interface UseRoomsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all rooms.
 * Endpoint: GET /api/v1/rooms
 */
export function useRooms(params?: UseRoomsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<RoomResponseDto[] | { content: RoomResponseDto[]; totalElements: number }, Error>({
    queryKey: [ROOMS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<RoomResponseDto[] | { content: RoomResponseDto[]; totalElements: number }>(
        '/api/v1/rooms',
        { params }
      );
      return response.data;
    }
  });

  const rooms = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    rooms,
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
 * Hook to fetch rooms by ward ID.
 * Endpoint: GET /api/v1/rooms/wards/{wardId}
 */
export function useRoomsByWard(wardId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<RoomResponseDto[], Error>({
    queryKey: [ROOMS_QUERY_KEY, 'ward', wardId],
    queryFn: async () => {
      if (!wardId) return [];
      const response = await axiosServices.get<RoomResponseDto[]>(
        `/api/v1/rooms/wards/${wardId}`
      );
      return response.data;
    },
    enabled: Boolean(wardId)
  });

  return {
    rooms: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch a single room by ID.
 * Endpoint: GET /api/v1/rooms/{id}
 */
export function useRoom(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<RoomResponseDto | null, Error>({
    queryKey: [ROOMS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<RoomResponseDto>(
        `/api/v1/rooms/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    room: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new room under a specific ward.
 * Endpoint: POST /api/v1/rooms/wards/{wardId}
 */
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation<RoomResponseDto, Error, { wardId: string; payload: RoomRequestDto; actorId: string }>({
    mutationFn: async ({ wardId, payload, actorId }) => {
      const response = await axiosServices.post<RoomResponseDto>(
        `/api/v1/rooms/wards/${wardId}`,
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
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing room (and optionally move it to a new ward).
 * Endpoint: PUT /api/v1/rooms/{id}/wards/{wardId}
 */
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation<RoomResponseDto, Error, { id: string; wardId: string; payload: RoomUpdateDto; actorId: string }>({
    mutationFn: async ({ id, wardId, payload, actorId }) => {
      const response = await axiosServices.put<RoomResponseDto>(
        `/api/v1/rooms/${id}/wards/${wardId}`,
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
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a room.
 * Endpoint: DELETE /api/v1/rooms/{id}
 */
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/rooms/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ROOMS_QUERY_KEY] });
    }
  });
}