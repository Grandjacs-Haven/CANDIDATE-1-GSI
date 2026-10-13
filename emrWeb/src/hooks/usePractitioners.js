import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Updated Backend Enum & DTOs)
// ============================================================================

export type PractitionerType = 
  | 'PHYSICIAN'
  | 'NURSE'
  | 'MIDWIFE'
  | 'PHARMACIST'
  | 'DENTIST'
  | 'LABORATORY_SCIENTIST'
  | 'RADIOGRAPHER'
  | 'PHYSIOTHERAPIST'
  | 'PSYCHOLOGIST'
  | 'COUNSELLOR'
  | 'OTHER';

export type UserRole = 'DOCTOR' | 'HOSPITAL_ADMIN' | 'ADMIN' | 'PATIENT' | 'NURSE';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface PractitionerRequestDto {
  practitionerNumber?: string | null;
  practitionerType: PractitionerType;
  professionalTitle?: string | null;
  licenseNumber?: string | null;
  registrationBody?: string | null;
  qualification?: string | null;
  specialty?: string | null;
  active?: boolean;
}

export interface PractitionerResponseDto {
  id: string; // UUID
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: UserRole;
  userStatus?: UserStatus;
  gender?: Gender;

  practitionerNumber?: string;
  practitionerType: PractitionerType;
  professionalTitle?: string;
  licenseNumber?: string;
  registrationBody?: string;
  qualification?: string;
  specialty?: string;
  active: boolean;
}

// Spring Data Page wrapper interface
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const PRACTITIONERS_QUERY_KEY = 'practitioners';

interface UsePractitionersParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch paged practitioners.
 * Endpoint: GET /api/v1/practitioners/paged
 */
export function usePractitioners(params?: UsePractitionersParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<PageResponse<PractitionerResponseDto> | PractitionerResponseDto[], Error>({
    queryKey: [PRACTITIONERS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<PageResponse<PractitionerResponseDto> | PractitionerResponseDto[]>(
        '/api/v1/practitioners/paged',
        { params }
      );
      return response.data;
    }
  });

  const practitioners = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    practitioners,
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
 * Hook to fetch a single practitioner by ID.
 * Endpoint: GET /api/v1/practitioners/{id}
 */
export function usePractitioner(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<PractitionerResponseDto | null, Error>({
    queryKey: [PRACTITIONERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<PractitionerResponseDto>(
        `/api/v1/practitioners/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    practitioner: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to update an existing practitioner's profile via PUT.
 * Endpoint: PUT /api/v1/practitioners/{id}
 */
export function useUpdatePractitioner() {
  const queryClient = useQueryClient();

  return useMutation<PractitionerResponseDto, Error, { id: string; payload: PractitionerRequestDto; actorId: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const response = await axiosServices.put<PractitionerResponseDto>(
        `/api/v1/practitioners/${id}`,
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
      queryClient.invalidateQueries({ queryKey: [PRACTITIONERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to remove/delete a practitioner profile.
 * Endpoint: DELETE /api/v1/practitioners/{id}
 */
export function useDeletePractitioner() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string }>({
    mutationFn: async ({ id, actorId }) => {
      await axiosServices.delete(
        `/api/v1/practitioners/${id}`,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PRACTITIONERS_QUERY_KEY] });
    }
  });
}