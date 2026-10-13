import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type UserRole = 'PRACTITIONER' | 'HOSPITAL_ADMIN' | 'ADMIN' ;

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserResponse {
  id: string; // UUID
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  userStatus: UserStatus;
  gender?: Gender;
}

export interface UserRegistrationRequestDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  role: UserRole;
  gender?: Gender | null;
}

export interface UserUpdateDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string | null;
  role?: UserRole;
  userStatus?: UserStatus;
  gender?: Gender | null;
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

const USERS_QUERY_KEY = 'users';

interface UseUsersParams {
  status?: UserStatus | '';
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all users with optional status filtering and pagination.
 * Endpoint: GET /api/v1/users
 */
export function useUsers(params?: UseUsersParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<PageResponse<UserResponse> | UserResponse[], Error>({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: async () => {
      // Clean up empty status filter before sending query params
      const queryParams: Record<string, any> = { ...params };
      if (!queryParams.status) {
        delete queryParams.status;
      }

      const response = await axiosServices.get<PageResponse<UserResponse> | UserResponse[]>(
        '/api/v1/users',
        { params: queryParams }
      );
      return response.data;
    }
  });

  // Handle both Spring Page objects or direct array responses safely
  const users = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    users,
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
 * Hook to fetch a single user by ID.
 * Endpoint: GET /api/v1/users/{id}
 */
export function useUser(id?: string, actorId?: string, correlationId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<UserResponse | null, Error>({
    queryKey: [USERS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const headers: Record<string, string> = {};
      if (actorId) headers['X-Actor-Id'] = actorId;
      if (correlationId) headers['X-Correlation-Id'] = correlationId;

      const response = await axiosServices.get<UserResponse>(
        `/api/v1/users/${id}`,
        { headers }
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    user: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to register a new user/staff member.
 * Endpoint: POST /api/v1/users
 */
export function useOnboardStaff() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { payload: UserRegistrationRequestDto; actorId: string; correlationId?: string }>({
    mutationFn: async ({ payload, actorId, correlationId }) => {
      const headers: Record<string, string> = {
        'X-Actor-Id': actorId
      };
      if (correlationId) headers['X-Correlation-Id'] = correlationId;

      const response = await axiosServices.post<UserResponse>(
        '/api/v1/users',
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing user via PUT.
 * Endpoint: PUT /api/v1/users/{id}
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UserResponse, Error, { id: string; payload: UserUpdateDto; actorId: string; correlationId?: string }>({
    mutationFn: async ({ id, payload, actorId, correlationId }) => {
      const headers: Record<string, string> = {
        'X-Actor-Id': actorId
      };
      if (correlationId) headers['X-Correlation-Id'] = correlationId;

      const response = await axiosServices.put<UserResponse>(
        `/api/v1/users/${id}`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete a user.
 * Endpoint: DELETE /api/v1/users/{id}
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId: string; correlationId?: string }>({
    mutationFn: async ({ id, actorId, correlationId }) => {
      const headers: Record<string, string> = {
        'X-Actor-Id': actorId
      };
      if (correlationId) headers['X-Correlation-Id'] = correlationId;

      await axiosServices.delete(`/api/v1/users/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
    }
  });
}