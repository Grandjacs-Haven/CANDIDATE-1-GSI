import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & DTOs
// ============================================================================

export type ClinicalNoteType = 'PROGRESS_NOTE' | 'DISCHARGE_SUMMARY' | 'DOCTOR_NOTE' | 'NURSE_NOTE';

export interface ClinicalNoteRequestDto {
  patientId: string; // UUID
  encounterId?: string | null; // UUID
  noteType: ClinicalNoteType;
  content: string;
}

export interface ClinicalNoteResponseDto {
  id: string; // UUID
  patientId: string; // UUID
  encounterId?: string; // UUID
  noteType: ClinicalNoteType;
  content: string;
  authorId?: string; // UUID
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const CLINICAL_NOTES_QUERY_KEY = 'clinical-notes';

/**
 * Hook to fetch a single clinical note by ID.
 * Endpoint: GET /api/v1/clinical-notes/{id}
 */
export function useClinicalNote(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ClinicalNoteResponseDto | null, Error>({
    queryKey: [CLINICAL_NOTES_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<ClinicalNoteResponseDto>(
        `/api/v1/clinical-notes/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    clinicalNote: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch all clinical notes for a specific patient.
 * Endpoint: GET /api/v1/clinical-notes/patient/{patientId}
 */
export function useClinicalNotesByPatient(patientId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ClinicalNoteResponseDto[], Error>({
    queryKey: [CLINICAL_NOTES_QUERY_KEY, 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await axiosServices.get<ClinicalNoteResponseDto[]>(
        `/api/v1/clinical-notes/patient/${patientId}`
      );
      return response.data;
    },
    enabled: Boolean(patientId)
  });

  return {
    clinicalNotes: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new clinical note.
 * Endpoint: POST /api/v1/clinical-notes
 */
export function useCreateClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation<ClinicalNoteResponseDto, Error, { payload: ClinicalNoteRequestDto; actorId: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const response = await axiosServices.post<ClinicalNoteResponseDto>(
        '/api/v1/clinical-notes',
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
      queryClient.invalidateQueries({ queryKey: [CLINICAL_NOTES_QUERY_KEY] });
      if (variables.payload.patientId) {
        queryClient.invalidateQueries({ queryKey: [CLINICAL_NOTES_QUERY_KEY, 'patient', variables.payload.patientId] });
      }
    }
  });
}

/**
 * Hook to update an existing clinical note via PUT.
 * Endpoint: PUT /api/v1/clinical-notes/{id}
 */
export function useUpdateClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation<ClinicalNoteResponseDto, Error, { id: string; payload: ClinicalNoteRequestDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<ClinicalNoteResponseDto>(
        `/api/v1/clinical-notes/${id}`,
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
      queryClient.invalidateQueries({ queryKey: [CLINICAL_NOTES_QUERY_KEY] });
      if (data?.patientId) {
        queryClient.invalidateQueries({ queryKey: [CLINICAL_NOTES_QUERY_KEY, 'patient', data.patientId] });
      }
    }
  });
}

/**
 * Hook to delete a clinical note.
 * Endpoint: DELETE /api/v1/clinical-notes/{id}
 */
export function useDeleteClinicalNote() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/clinical-notes/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CLINICAL_NOTES_QUERY_KEY] });
    }
  });
}