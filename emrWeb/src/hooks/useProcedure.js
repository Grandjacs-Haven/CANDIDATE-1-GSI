import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller, Enums & DTOs)
// ============================================================================

export type ProcedureStatus = 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'ENTERED_IN_ERROR';

export type ProcedureType =
  // Emergency & bedside procedures
  | 'WOUND_SUTURING'
  | 'WOUND_DEBRIDEMENT'
  | 'ENDOTRACHEAL_INTUBATION'
  | 'CHEST_TUBE_INSERTION'
  | 'CENTRAL_VENOUS_CATHETER'
  | 'LUMBAR_PUNCTURE'
  | 'CARDIOCENTESIS'
  | 'EMERGENCY_TRACHEOSTOMY'
  | 'CARDIOVERSION'
  | 'JOINT_ASPIRATION'
  // General surgery
  | 'APPENDSECTOMY'
  | 'CHOLECYSTECTOMY'
  | 'HERNIA_REPAIR'
  | 'EXPLORATORY_LAPAROTOMY'
  | 'BOWEL_RESECTION'
  | 'MASTECTOMY'
  | 'THYROIDECTOMY'
  // Obstetrics & gynecology
  | 'CESAREAN_SECTION'
  | 'DILATION_AND_CURETTAGE'
  | 'TUBAL_LIGATION'
  // Orthopedics & trauma
  | 'CLOSED_REDUCTION'
  | 'OPEN_REDUCTION_INTERNAL_FIXATION'
  | 'FASCIOTOMY';

export interface ProcedureRequestDto {
  encounterId: string; // UUID
  procedureType: ProcedureType;
  status?: ProcedureStatus;
  performedAt?: string | null; // ZonedDateTime as ISO string
  notes?: string | null;
}

export interface ProcedureUpdateDto {
  encounterId?: string | null; // UUID
  procedureType?: ProcedureType | null;
  status?: ProcedureStatus | null;
  performedAt?: string | null; // ZonedDateTime as ISO string
  notes?: string | null;
}

export interface ProcedureResponseDto {
  id: string; // UUID
  encounterId: string; // UUID
  procedureType: ProcedureType;
  status: ProcedureStatus;
  performedAt?: string; // ZonedDateTime as ISO string
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const PROCEDURES_QUERY_KEY = 'procedures';

interface UseProceduresParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all procedures.
 * Endpoint: GET /api/v1/procedures
 */
export function useProcedures(params?: UseProceduresParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<ProcedureResponseDto[] | { content: ProcedureResponseDto[]; totalElements: number }, Error>({
    queryKey: [PROCEDURES_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<ProcedureResponseDto[] | { content: ProcedureResponseDto[]; totalElements: number }>(
        '/api/v1/procedures',
        { params }
      );
      return response.data;
    }
  });

  const procedures = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    procedures,
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
 * Hook to fetch all procedures for a specific encounter ID.
 * Endpoint: GET /api/v1/procedures/encounters/{encounterId}
 */
export function useProceduresByEncounter(encounterId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProcedureResponseDto[], Error>({
    queryKey: [PROCEDURES_QUERY_KEY, 'encounter', encounterId],
    queryFn: async () => {
      if (!encounterId) return [];
      const response = await axiosServices.get<ProcedureResponseDto[]>(
        `/api/v1/procedures/encounters/${encounterId}`
      );
      return response.data;
    },
    enabled: Boolean(encounterId)
  });

  return {
    procedures: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch a single procedure by ID.
 * Endpoint: GET /api/v1/procedures/{id}
 */
export function useProcedure(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProcedureResponseDto | null, Error>({
    queryKey: [PROCEDURES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<ProcedureResponseDto>(
        `/api/v1/procedures/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    procedure: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new procedure.
 * Endpoint: POST /api/v1/procedures
 */
export function useCreateProcedure() {
  const queryClient = useQueryClient();

  return useMutation<ProcedureResponseDto, Error, { payload: ProcedureRequestDto; actorId: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const response = await axiosServices.post<ProcedureResponseDto>(
        '/api/v1/procedures',
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
      queryClient.invalidateQueries({ queryKey: [PROCEDURES_QUERY_KEY] });
      if (variables.payload.encounterId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURES_QUERY_KEY, 'encounter', variables.payload.encounterId] });
      }
    }
  });
}

/**
 * Hook to update an existing procedure via PUT.
 * Endpoint: PUT /api/v1/procedures/{id}
 */
export function useUpdateProcedure() {
  const queryClient = useQueryClient();

  return useMutation<ProcedureResponseDto, Error, { id: string; payload: ProcedureUpdateDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<ProcedureResponseDto>(
        `/api/v1/procedures/${id}`,
        payload,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [PROCEDURES_QUERY_KEY] });
      if (data?.encounterId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURES_QUERY_KEY, 'encounter', data.encounterId] });
      }
    }
  });
}

/**
 * Hook to delete a procedure.
 * Endpoint: DELETE /api/v1/procedures/{id}
 */
export function useDeleteProcedure() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/procedures/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCEDURES_QUERY_KEY] });
    }
  });
}