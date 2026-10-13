import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller & DTOs)
// ============================================================================

export type AppointmentType = 'SCHEDULED' | 'WALK_IN' | 'EMERGENCY' | 'FOLLOW_UP';

export type AppointmentStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'ARRIVED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'CANCELLED' 
  | 'NO_SHOW';

export interface AppointmentRequestDto {
  patientId: string; // UUID
  doctorId?: string | null; // UUID
  appointmentType: AppointmentType;
  status?: AppointmentStatus;
  scheduledStartTime: string; // ZonedDateTime as ISO string
  actualArrivalTime?: string | null; // ZonedDateTime as ISO string
}

export interface AppointmentResponseDto {
  id: string; // UUID
  patientId: string; // UUID
  doctorId?: string; // UUID
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  scheduledStartTime: string; // ZonedDateTime as ISO string
  actualArrivalTime?: string; // ZonedDateTime as ISO string
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const APPOINTMENTS_QUERY_KEY = 'appointments';

interface UseAppointmentsParams {
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Hook to fetch all appointments (supports pagination/sorting if handled by service, or standard array return).
 */
export function useAppointments(params?: UseAppointmentsParams) {
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery<AppointmentResponseDto[] | { content: AppointmentResponseDto[]; totalElements: number }, Error>({
    queryKey: [APPOINTMENTS_QUERY_KEY, params],
    queryFn: async () => {
      const response = await axiosServices.get<AppointmentResponseDto[] | { content: AppointmentResponseDto[]; totalElements: number }>(
        '/api/v1/appointments',
        { params }
      );
      return response.data;
    }
  });

  // Handle both list returns or paginated wrapper objects
  const appointments = Array.isArray(data) ? data : (data?.content || []);
  const totalElements = Array.isArray(data) ? data.length : (data?.totalElements || 0);

  return {
    appointments,
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
 * Hook to fetch a single appointment by ID.
 */
export function useAppointment(id?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<AppointmentResponseDto | null, Error>({
    queryKey: [APPOINTMENTS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const response = await axiosServices.get<AppointmentResponseDto>(
        `/api/v1/appointments/${id}`
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    appointment: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch appointments by patient ID.
 * Endpoint: GET /api/v1/appointments/patients/{patientId}
 */
export function useAppointmentsByPatient(patientId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<AppointmentResponseDto[], Error>({
    queryKey: [APPOINTMENTS_QUERY_KEY, 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await axiosServices.get<AppointmentResponseDto[]>(
        `/api/v1/appointments/patients/${patientId}`
      );
      return response.data;
    },
    enabled: Boolean(patientId)
  });

  return {
    appointments: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to create a new appointment.
 * Endpoint: POST /api/v1/appointments
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentResponseDto, Error, { payload: AppointmentRequestDto; actorId?: string }>({
    mutationFn: async ({ payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.post<AppointmentResponseDto>(
        '/api/v1/appointments',
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to update an existing appointment via PUT.
 * Endpoint: PUT /api/v1/appointments/{id}
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient();

  return useMutation<AppointmentResponseDto, Error, { id: string; payload: AppointmentRequestDto; actorId?: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.put<AppointmentResponseDto>(
        `/api/v1/appointments/${id}`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to delete an appointment.
 * Endpoint: DELETE /api/v1/appointments/{id}
 */
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId?: string }>({
    mutationFn: async ({ id, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      await axiosServices.delete(`/api/v1/appointments/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APPOINTMENTS_QUERY_KEY] });
    }
  });
}