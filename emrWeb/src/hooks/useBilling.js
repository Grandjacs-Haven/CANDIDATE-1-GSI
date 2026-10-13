import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosServices from '../../utils/axios'; // Adjust path to your axios instance as needed

// ============================================================================
// TYPESCRIPT INTERFACES & ENUMS
// ============================================================================

export type BillingStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED' | 'REFUNDED';

export interface BillingItemResponseDto {
  id: string; // UUID
  billingId: string; // UUID
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt?: string;
}

export interface BillingResponseDto {
  id: string; // UUID
  patientId: string; // UUID
  encounterId?: string; // UUID
  totalAmount: number;
  status: BillingStatus;
  issuedAt?: string;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// REACT QUERY HOOKS
// ============================================================================

const BILLINGS_QUERY_KEY = 'billings';

/**
 * Hook to add an encounter charge and generate/update a bill.
 * Endpoint: POST /api/v1/billings/encounters/{encounterId}/charge
 */
export function useAddEncounterCharge() {
  const queryClient = useQueryClient();

  return useMutation<BillingResponseDto, Error, { encounterId: string; actorId: string }>({
    mutationFn: async ({ encounterId, actorId }) => {
      const response = await axiosServices.post<BillingResponseDto>(
        `/api/v1/billings/encounters/${encounterId}/charge`,
        null,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLINGS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to add a procedure charge and update the bill.
 * Endpoint: POST /api/v1/billings/procedures/{procedureId}/charge
 */
export function useAddProcedureCharge() {
  const queryClient = useQueryClient();

  return useMutation<BillingResponseDto, Error, { procedureId: string; actorId: string }>({
    mutationFn: async ({ procedureId, actorId }) => {
      const response = await axiosServices.post<BillingResponseDto>(
        `/api/v1/billings/procedures/${procedureId}/charge`,
        null,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLINGS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to issue a bill.
 * Endpoint: PUT /api/v1/billings/{billingId}/issue
 */
export function useIssueBill() {
  const queryClient = useQueryClient();

  return useMutation<BillingResponseDto, Error, { billingId: string; actorId: string }>({
    mutationFn: async ({ billingId, actorId }) => {
      const response = await axiosServices.put<BillingResponseDto>(
        `/api/v1/billings/${billingId}/issue`,
        null,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLINGS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to mark a bill as paid.
 * Endpoint: PUT /api/v1/billings/{billingId}/pay
 */
export function useMarkBillAsPaid() {
  const queryClient = useQueryClient();

  return useMutation<BillingResponseDto, Error, { billingId: string; actorId: string }>({
    mutationFn: async ({ billingId, actorId }) => {
      const response = await axiosServices.put<BillingResponseDto>(
        `/api/v1/billings/${billingId}/pay`,
        null,
        {
          headers: {
            'X-Actor-Id': actorId
          }
        }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [BILLINGS_QUERY_KEY] });
    }
  });
}

/**
 * Hook to fetch bills by patient ID.
 * Endpoint: GET /api/v1/billings/patients/{patientId}
 */
export function useBillsByPatient(patientId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<BillingResponseDto[], Error>({
    queryKey: [BILLINGS_QUERY_KEY, 'patient', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await axiosServices.get<BillingResponseDto[]>(
        `/api/v1/billings/patients/${patientId}`
      );
      return response.data;
    },
    enabled: Boolean(patientId)
  });

  return {
    bills: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch a bill by encounter ID.
 * Endpoint: GET /api/v1/billings/encounters/{encounterId}
 */
export function useBillByEncounter(encounterId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<BillingResponseDto | null, Error>({
    queryKey: [BILLINGS_QUERY_KEY, 'encounter', encounterId],
    queryFn: async () => {
      if (!encounterId) return null;
      const response = await axiosServices.get<BillingResponseDto>(
        `/api/v1/billings/encounters/${encounterId}`
      );
      return response.data;
    },
    enabled: Boolean(encounterId)
  });

  return {
    bill: data,
    isLoading,
    isError,
    error,
    refetch
  };
}

/**
 * Hook to fetch line items for a specific bill.
 * Endpoint: GET /api/v1/billings/{billingId}/items
 */
export function useBillingItems(billingId?: string) {
  const { data, isLoading, isError, error, refetch } = useQuery<BillingItemResponseDto[], Error>({
    queryKey: [BILLINGS_QUERY_KEY, billingId, 'items'],
    queryFn: async () => {
      if (!billingId) return [];
      const response = await axiosServices.get<BillingItemResponseDto[]>(
        `/api/v1/billings/${billingId}/items`
      );
      return response.data;
    },
    enabled: Boolean(billingId)
  });

  return {
    items: data || [],
    isLoading,
    isError,
    error,
    refetch
  };
}