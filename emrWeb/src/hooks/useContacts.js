import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type RelationshipType = 
  | 'SPOUSE'
  | 'PARENT'
  | 'CHILD'
  | 'SIBLING'
  | 'GUARDIAN'
  | 'FRIEND'
  | 'OTHER';

export interface ContactPoint {
  system?: 'PHONE' | 'EMAIL' | 'FAX' | 'PAGER' | 'URL' | 'SMS';
  value?: string;
  use?: 'HOME' | 'WORK' | 'TEMP' | 'OLD' | 'MOBILE';
  rank?: number;
}

export interface AddressRequest {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface AddressResponseDto {
  id: string; // UUID
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ContactRequestDto {
  patientId?: string | null;         // UUID
  nextOfKinPatientId?: string | null; // UUID
  practitionerId?: string | null;    // UUID
  name: string;
  relationshipType?: RelationshipType;
  telecom?: ContactPoint[];
  address?: AddressRequest;
}

export interface ContactResponseDto {
  id: string; // UUID
  patientId?: string; // UUID
  relationship?: RelationshipType;
  name: string;
  telecom?: ContactPoint[];
  address?: AddressResponseDto;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const CONTACTS_QUERY_KEY = 'contacts';

interface UseContactsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all contacts.
 * Endpoint: GET /api/v1/contacts
 */
export function useContacts(params?: UseContactsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<ContactResponseDto[] | { content: ContactResponseDto[]; totalElements: number }, Error>({
    queryKey: [CONTACTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<ContactResponseDto[] | { content: ContactResponseDto[]; totalElements: number }>(
        '/api/v1/contacts',
        { params }
      );
      return response.data;
    }
  });

  const contacts = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    contacts,
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
 * Hook to fetch a single contact by ID.
 * Endpoint: GET /api/v1/contacts/{id}
 */
export function useContact(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ContactResponseDto | null, Error>({
    queryKey: [CONTACTS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<ContactResponseDto>(
        `/api/v1/contacts/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    contact: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new contact.
 * Endpoint: POST /api/v1/contacts
 */
export function useCreateContact() {
  const queryClient = useQueryClient();

  return useMutation<ContactResponseDto, Error, { payload: ContactRequestDto; actorId?: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.post<ContactResponseDto>(
        '/api/v1/contacts',
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing contact via PUT.
 * Endpoint: PUT /api/v1/contacts/{id}
 */
export function useUpdateContact() {
  const queryClient = useQueryClient();

  return useMutation<ContactResponseDto, Error, { id: string; payload: ContactRequestDto; actorId?: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.put<ContactResponseDto>(
        `/api/v1/contacts/${id}`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a contact.
 * Endpoint: DELETE /api/v1/contacts/{id}
 */
export function useDeleteContact() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId?: string }>({
    mutationFn: async ({ id, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      await axiosServices.delete(`/api/v1/contacts/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    }
  });
}