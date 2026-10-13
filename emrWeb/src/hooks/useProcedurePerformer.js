import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller, Enums & DTOs)
// ============================================================================

export type ProcedurePerformerRole =
  | 'PRIMARY_SURGEON'
  | 'ASSISTANT_SURGEON'
  | 'ANESTHESIOLOGIST'
  | 'ANESTHETIST'
  | 'SCRUB_NURSE'
  | 'CIRCULATING_NURSE'
  | 'OTHER';

export interface ProcedurePerformerRequestDto {
  procedureId: string; // UUID
  practitionerId: string; // UUID
  performerRole: ProcedurePerformerRole;
}

export interface ProcedurePerformerUpdateDto {
  procedureId?: string | null; // UUID
  practitionerId?: string | null; // UUID
  performerRole?: ProcedurePerformerRole | null;
}

export interface ProcedurePerformerResponseDto {
  id: string; // UUID
  procedureId: string; // UUID
  practitionerId: string; // UUID
  performerRole: ProcedurePerformerRole;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const PROCEDURE_PERFORMERS_QUERY_KEY = 'procedure-performers';

/**
 * Hook to fetch a single procedure performer by ID.
 * Endpoint: GET /api/v1/procedure-performers/{id}
 */
export function useProcedurePerformer(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProcedurePerformerResponseDto | null, Error>({
    queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<ProcedurePerformerResponseDto>(
        `/api/v1/procedure-performers/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    performer: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch all performers assigned to a specific procedure.
 * Endpoint: GET /api/v1/procedure-performers/procedure/{procedureId}
 */
export function useProcedurePerformersByProcedure(procedureId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProcedurePerformerResponseDto[], Error>({
    queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'procedure', procedureId],
    queryFn: async () => {
      if (!procedureId) return [];
      const response = await axiosServices.get<ProcedurePerformerResponseDto[]>(
        `/api/v1/procedure-performers/procedure/${procedureId}`
      );
      return response.data;
    },
    enabled: Boolean(procedureId)
  });

  return {
    performers: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch all procedure performer assignments for a specific practitioner.
 * Endpoint: GET /api/v1/procedure-performers/practitioner/{practitionerId}
 */
export function useProcedurePerformersByPractitioner(practitionerId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ProcedurePerformerResponseDto[], Error>({
    queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'practitioner', practitionerId],
    queryFn: async () => {
      if (!practitionerId) return [];
      const response = await axiosServices.get<ProcedurePerformerResponseDto[]>(
        `/api/v1/procedure-performers/practitioner/${practitionerId}`
      );
      return response.data;
    },
    enabled: Boolean(practitionerId)
  });

  return {
    performers: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to assign a practitioner as a procedure performer.
 * Endpoint: POST /api/v1/procedure-performers
 */
export function useCreateProcedurePerformer() {
  const queryClient = useQueryClient();

  return useMutation<ProcedurePerformerResponseDto, Error, { payload: ProcedurePerformerRequestDto; actorId: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const response = await axiosServices.post<ProcedurePerformerResponseDto>(
        '/api/v1/procedure-performers',
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
      queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY] });
      if (variables.payload.procedureId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'procedure', variables.payload.procedureId] });
      }
      if (variables.payload.practitionerId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'practitioner', variables.payload.practitionerId] });
      }
    }
  });
}

/**
 * Hook to update an existing procedure performer record via PUT.
 * Endpoint: PUT /api/v1/procedure-performers/{id}
 */
export function useUpdateProcedurePerformer() {
  const queryClient = useQueryClient();

  return useMutation<ProcedurePerformerResponseDto, Error, { id: string; payload: ProcedurePerformerUpdateDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<ProcedurePerformerResponseDto>(
        `/api/v1/procedure-performers/${id}`,
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
      queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY] });
      if (data?.procedureId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'procedure', data.procedureId] });
      }
      if (data?.practitionerId) {
        queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY, 'practitioner', data.practitionerId] });
      }
    }
  });
}

/**
 * Hook to update just the performer role via PATCH.
 * Endpoint: PATCH /api/v1/procedure-performers/{id}/role?role=...
 */
export function useUpdateProcedurePerformerRole() {
  const queryClient = useQueryClient();

  return useMutation<ProcedurePerformerResponseDto, Error, { id: string; role: ProcedurePerformerRole; actorId: string }>({
    mutationFn: async ({ id, role, actorId }) => {
      const response = await axiosServices.patch<ProcedurePerformerResponseDto>(
        `/api/v1/procedure-performers/${id}/role`,
        null,
        {
          params: { role },
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a procedure performer assignment.
 * Endpoint: DELETE /api/v1/procedure-performers/{id}
 */
export function useDeleteProcedurePerformer() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/procedure-performers/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROCEDURE_PERFORMERS_QUERY_KEY] });
    }
  });
}