import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS (Matching Backend Controller, Enums & DTOs)
// ============================================================================

export type ObservationType =
  // --- Vital Signs ---
  | 'HEART_RATE'
  | 'PULSE_RATE'
  | 'SYSTOLIC_BP'
  | 'DIASTOLIC_BP'
  | 'MEAN_ARTERIAL_PRESSURE'
  | 'BODY_TEMPERATURE'
  | 'RESPIRATORY_RATE'
  | 'OXYGEN_SATURATION'
  | 'PAIN_SCORE'
  // --- Anthropometric & Physical Measurements ---
  | 'BODY_WEIGHT'
  | 'BODY_HEIGHT'
  | 'BODY_MASS_INDEX'
  | 'HEAD_CIRCUMFERENCE'
  | 'WAIST_CIRCUMFERENCE'
  // --- Blood Glucose & Metabolism ---
  | 'BLOOD_GLUCOSE_FASTING'
  | 'BLOOD_GLUCOSE_RANDOM'
  | 'HBA1C'
  // --- Hematology (Blood Counts) ---
  | 'HEMOGLOBIN'
  | 'HEMATOCRIT'
  | 'WHITE_BLOOD_CELL_COUNT'
  | 'RED_BLOOD_CELL_COUNT'
  | 'PLATELET_COUNT'
  // --- Renal & Electrolytes ---
  | 'SERUM_CREATININE'
  | 'BLOOD_UREA_NITROGEN'
  | 'SODIUM'
  | 'POTASSIUM'
  | 'CHLORIDE'
  | 'BICARBONATE'
  // --- Liver Function ---
  | 'ALT'
  | 'AST'
  | 'TOTAL_BILIRUBIN'
  | 'ALBUMIN'
  // --- Clinical Scoring & Output ---
  | 'GLASGOW_COMA_SCALE'
  | 'URINE_OUTPUT'
  | 'AVPU_SCORE';

export interface ObservationRequestDto {
  observationType: ObservationType;
  numericValue: number | string; // BigDecimal representation
}

export interface ObservationUpdateDto {
  observationType?: ObservationType | null;
  numericValue?: number | string | null;
}

export interface ObservationResponseDto {
  id: string; // UUID
  encounterId: string; // UUID
  observationType: ObservationType;
  displayName: string;
  numericValue: number;
  unit: string;
  effectiveAt?: string; // LocalDateTime as ISO string
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const OBSERVATIONS_QUERY_KEY = 'observations';

/**
 * Hook to fetch a single observation by ID.
 * Endpoint: GET /api/v1/observation/observations/{id}
 */
export function useObservation(id?: string, actorId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ObservationResponseDto | null, Error>({
    queryKey: [OBSERVATIONS_QUERY_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.get<ObservationResponseDto>(
        `/api/v1/observation/observations/${id}`,
        { headers }
      );
      return response.data;
    },
    enabled: Boolean(id)
  });

  return {
    observation: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch all observations for a specific encounter.
 * Endpoint: GET /api/v1/observation/encounters/{encounterId}/observations
 */
export function useObservationsByEncounter(encounterId?: string, actorId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<ObservationResponseDto[], Error>({
    queryKey: [OBSERVATIONS_QUERY_KEY, 'encounter', encounterId],
    queryFn: async () => {
      if (!encounterId) return [];
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.get<ObservationResponseDto[]>(
        `/api/v1/observation/encounters/${encounterId}/observations`,
        { headers }
      );
      return response.data;
    },
    enabled: Boolean(encounterId)
  });

  return {
    observations: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to record a new observation for an encounter.
 * Endpoint: POST /api/v1/observation/encounters/{encounterId}/observations
 */
export function useRecordObservation() {
  const queryClient = useQueryClient();

  return useMutation<ObservationResponseDto, Error, { encounterId: string; payload: ObservationRequestDto; actorId?: string }>({
    mutationFn: async ({ encounterId, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.post<ObservationResponseDto>(
        `/api/v1/observation/encounters/${encounterId}/observations`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [OBSERVATIONS_QUERY_KEY] });
      if (variables.encounterId) {
        queryClient.invalidateQueries({ queryKey: [OBSERVATIONS_QUERY_KEY, 'encounter', variables.encounterId] });
      }
    }
  });
}

/**
 * Hook to update an existing observation via PATCH.
 * Endpoint: PATCH /api/v1/observation/observations/{id}
 */
export function useUpdateObservation() {
  const queryClient = useQueryClient();

  return useMutation<ObservationResponseDto, Error, { id: string; payload: ObservationUpdateDto; actorId?: string }>({
    mutationFn: async ({ id, payload, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      const response = await axiosServices.patch<ObservationResponseDto>(
        `/api/v1/observation/observations/${id}`,
        payload,
        { headers }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [OBSERVATIONS_QUERY_KEY] });
      if (data?.encounterId) {
        queryClient.invalidateQueries({ queryKey: [OBSERVATIONS_QUERY_KEY, 'encounter', data.encounterId] });
      }
    }
  });
}

/**
 * Hook to delete an observation.
 * Endpoint: DELETE /api/v1/observation/observations/{id}
 */
export function useDeleteObservation() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { id: string; actorId?: string }>({
    mutationFn: async ({ id, actorId }) => {
      const headers = actorId ? { 'X-Actor-Id': actorId } : {};
      await axiosServices.delete(`/api/v1/observation/observations/${id}`, { headers });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [OBSERVATIONS_QUERY_KEY] });
    }
  });
}