import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type EncounterLocationStatus = 
  | 'ACTIVE' 
  | 'COMPLETED' 
  | 'TRANSFERRED' 
  | 'CANCELLED';

export interface EncounterLocationRequestDto {
  wardId: string; // UUID
  roomId?: string | null; // UUID
  bedId?: string | null; // UUID
  status?: EncounterLocationStatus;
  periodStart: string; // LocalDateTime as ISO string (e.g. "2026-10-13T08:00:00")
  periodEnd?: string | null; // LocalDateTime as ISO string
}

export interface EncounterLocationUpdateDto {
  wardId?: string | null; // UUID
  roomId?: string | null; // UUID
  bedId?: string | null; // UUID
  status?: EncounterLocationStatus | null;
  periodStart?: string | null; // LocalDateTime as ISO string
  periodEnd?: string | null; // LocalDateTime as ISO string
}

export interface EncounterLocationResponseDto {
  id: string; // UUID
  encounterId: string; // UUID
  wardId: string; // UUID
  roomId?: string; // UUID
  bedId?: string; // UUID
  status: EncounterLocationStatus;
  periodStart: string; // LocalDateTime as ISO string
  periodEnd?: string; // LocalDateTime as ISO string
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const ENCOUNTER_LOCATIONS_QUERY_KEY = 'encounter-locations';

interface UseEncounterLocationsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all encounter locations/history records.
 * Endpoint: GET /api/v1/encounter-history/encounter-locations
 */
export function useEncounterLocations(params?: UseEncounterLocationsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<EncounterLocationResponseDto[] | { content: EncounterLocationResponseDto[]; totalElements: number }, Error>({
    queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<EncounterLocationResponseDto[] | { content: EncounterLocationResponseDto[]; totalElements: number }>(
        '/api/v1/encounter-history/encounter-locations',
        { params }
      );
      return response.data;
    }
  });

  const locations = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    locations,
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
 * Hook to fetch all location history records for a specific encounter ID.
 * Endpoint: GET /api/v1/encounter-history/encounters/{encounterId}/locations
 */
export function useEncounterLocationsByEncounter(encounterId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<EncounterLocationResponseDto[], Error>({
    queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY, 'encounter', encounterId],
    queryFn: async () => {
      if (!encounterId) return [];
      const response = await axiosServices.get<EncounterLocationResponseDto[]>(
        `/api/v1/encounter-history/encounters/${encounterId}/locations`
      );
      return response.data;
    },
    enabled: Boolean(encounterId)
  });

  return {
    locations: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch a single encounter location record by its ID.
 * Endpoint: GET /api/v1/encounter-history/encounter-locations/{id}
 */
export function useEncounterLocation(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<EncounterLocationResponseDto | null, Error>({
    queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<EncounterLocationResponseDto>(
        `/api/v1/encounter-history/encounter-locations/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    location: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new location history entry for an encounter.
 * Endpoint: POST /api/v1/encounter-history/encounters/{encounterId}/locations
 */
export function useCreateEncounterLocation() {
  const queryClient = useQueryClient();

  return useMutation<EncounterLocationResponseDto, Error, { encounterId: string; payload: EncounterLocationRequestDto; actorId?: string }>({
    mutationFn: async ({ encounterId, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.post<EncounterLocationResponseDto>(
        `/api/v1/encounter-history/encounters/${encounterId}/locations`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY, 'encounter', variables.encounterId] });
    }
  });
}

/**
 * Hook to update an existing encounter location history record.
 * Endpoint: PUT /api/v1/encounter-history/encounter-locations/{id}/encounters/{encounterId}
 */
export function useUpdateEncounterLocation() {
  const queryClient = useQueryClient();

  return useMutation<EncounterLocationResponseDto, Error, { id: string; encounterId: string; payload: EncounterLocationUpdateDto; actorId?: string }>({
    mutationFn: async ({ id, encounterId, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.put<EncounterLocationResponseDto>(
        `/api/v1/encounter-history/encounter-locations/${id}/encounters/${encounterId}`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY, 'encounter', variables.encounterId] });
    }
  });
}

/**
 * Hook to delete an encounter location history record.
 * Endpoint: DELETE /api/v1/encounter-history/encounter-locations/{id}
 */
export function useDeleteEncounterLocation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId?: string }>({
    mutationFn: async ({ id, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      await axiosServices.delete(`/api/v1/encounter-history/encounter-locations/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENCOUNTER_LOCATIONS_QUERY_KEY] });
    }
  });
}