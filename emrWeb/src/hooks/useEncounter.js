import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type EncounterStatus = 
  | 'PLANNED' 
  | 'ARRIVED' 
  | 'IN_PROGRESS' 
  | 'TRIAGED' 
  | 'FINISHED' 
  | 'CANCELLED';

export type EncounterClass = 
  | 'AMBULATORY' 
  | 'EMERGENCY' 
  | 'INPATIENT' 
  | 'OBSERVATION' 
  | 'VIRTUAL';

export type EncounterType = 
  | 'INITIAL_CONSULTATION' 
  | 'CONSULTATION' 
  | 'FOLLOW_UP' 
  | 'PROCEDURE' 
  | 'EMERGENCY_CARE' 
  | 'ROUTINE_CHECKUP';

export type EncounterPriority = 
  | 'ROUTINE' 
  | 'URGENT' 
  | 'EMERGENCY' 
  | 'STAT';

export interface EncounterRequestDto {
  encounterNumber: string;
  appointmentId: string; // UUID
  status: EncounterStatus;
  encounterClass: EncounterClass;
  encounterType?: EncounterType | null;
  priority: EncounterPriority;
  actualStart?: string | null; // LocalDateTime as ISO string (e.g. "2026-10-13T09:30:00")
  actualEnd?: string | null;   // LocalDateTime as ISO string
}

export interface EncounterResponseDto {
  id: string; // UUID
  encounterNumber: string;
  appointmentId: string; // UUID
  status: EncounterStatus;
  encounterClass: EncounterClass;
  encounterType?: EncounterType;
  priority: EncounterPriority;
  actualStart?: string;
  actualEnd?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const ENCOUNTERS_QUERY_KEY = 'encounters';

interface UseEncountersParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all encounters.
 * Endpoint: GET /api/v1/encounters
 */
export function useEncounters(params?: UseEncountersParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<EncounterResponseDto[] | { content: EncounterResponseDto[]; totalElements: number }, Error>({
    queryKey: [ENCOUNTERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<EncounterResponseDto[] | { content: EncounterResponseDto[]; totalElements: number }>(
        '/api/v1/encounters',
        { params }
      );
      return response.data;
    }
  });

  const encounters = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    encounters,
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
 * Hook to fetch a single encounter by ID.
 * Endpoint: GET /api/v1/encounters/{id}
 */
export function useEncounter(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<EncounterResponseDto | null, Error>({
    queryKey: [ENCOUNTERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<EncounterResponseDto>(
        `/api/v1/encounters/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    encounter: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch encounters by a set of appointment IDs.
 * Endpoint: GET /api/v1/encounters/by-appointments?appointmentIds=...
 */
export function useEncountersByAppointments(appointmentIds?: string[]) {
  const { data, isLoading, isError, error, refetch } = useQuery<EncounterResponseDto[], Error>({
    queryKey: [ENCOUNTERS_QUERY_KEY, 'by-appointments', appointmentIds],
    queryFn: async () => {
      if (!appointmentIds || appointmentIds.length === 0) return [];
      const response = await axiosServices.get<EncounterResponseDto[]>(
        '/api/v1/encounters/by-appointments',
        {
          params: {
            appointmentIds: appointmentIds.join(',')
          }
        }
      );
      return response.data;
    },
    enabled: Boolean(appointmentIds && appointmentIds.length > 0)
  });

  return {
    encounters: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new encounter.
 * Endpoint: POST /api/v1/encounters
 */
export function useCreateEncounter() {
  const queryClient = useQueryClient();

  return useMutation<EncounterResponseDto, Error, { payload: EncounterRequestDto; actorId: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const response = await axiosServices.post<EncounterResponseDto>(
        '/api/v1/encounters',
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
      queryClient.invalidateQueries({ queryKey: [ENCOUNTERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing encounter via PUT.
 * Endpoint: PUT /api/v1/encounters/{id}
 */
export function useUpdateEncounter() {
  const queryClient = useQueryClient();

  return useMutation<EncounterResponseDto, Error, { id: string; payload: EncounterRequestDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<EncounterResponseDto>(
        `/api/v1/encounters/${id}`,
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
      queryClient.invalidateQueries({ queryKey: [ENCOUNTERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete an encounter.
 * Endpoint: DELETE /api/v1/encounters/{id}
 */
export function useDeleteEncounter() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/encounters/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ENCOUNTERS_QUERY_KEY] });
    }
  });
}