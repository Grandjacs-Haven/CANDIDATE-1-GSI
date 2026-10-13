import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const HOSPITAL_ADMINS_URL = '/hospital-admins';

export const hospitalAdminKeys = {
  all: ['hospital-admins'],
  lists: () => [...hospitalAdminKeys.all, 'list'],
  list: (params) => [...hospitalAdminKeys.lists(), params],
  detail: (userId) => [...hospitalAdminKeys.all, 'detail', userId],
  hospital: (hospitalId) => [...hospitalAdminKeys.all, 'hospital', hospitalId],
  access: (adminId, hospitalId) => [...hospitalAdminKeys.all, 'access', adminId, hospitalId]
};

function getItemsFromPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function getTotalElements(payload) {
  if (typeof payload?.totalElements === 'number') return payload.totalElements;
  if (typeof payload?.total === 'number') return payload.total;
  if (Array.isArray(payload)) return payload.length;
  return 0;
}

/**
 * GET /hospital-admins
 */
export function useHospitalAdmins(params = {}) {
  const { page = 0, size = 10, sort = 'createdAt,asc' } = params;

  const queryParams = {
    page,
    size,
    sort
  };

  const query = useQuery({
    queryKey: hospitalAdminKeys.list(queryParams),
    queryFn: async () => {
      const response = await api.get(HOSPITAL_ADMINS_URL, {
        params: queryParams
      });

      return response.data;
    },
    keepPreviousData: true
  });

  return {
    ...query,
    admins: getItemsFromPayload(query.data),
    totalElements: getTotalElements(query.data),
    mutate: query.refetch
  };
}

/**
 * GET /hospital-admins/{userId}
 */
export function useHospitalAdmin(userId) {
  return useQuery({
    queryKey: hospitalAdminKeys.detail(userId),
    queryFn: async () => {
      const response = await api.get(`${HOSPITAL_ADMINS_URL}/${userId}`);
      return response.data;
    },
    enabled: Boolean(userId)
  });
}

/**
 * PATCH /hospital-admins/{userId}
 */
export function useUpdateHospitalAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, payload, actorId }) => {
      const response = await api.patch(`${HOSPITAL_ADMINS_URL}/${userId}`, payload, {
        headers: {
          'X-Actor-Id': actorId
        }
      });

      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all });

      if (variables?.userId) {
        queryClient.invalidateQueries({
          queryKey: hospitalAdminKeys.detail(variables.userId)
        });
      }
    }
  });
}

/**
 * POST /hospital-admins/link/user/{userId}/hospital/{hospitalId}
 */
export function useLinkHospitalAdminToHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, hospitalId }) => {
      await api.post(`${HOSPITAL_ADMINS_URL}/link/user/${userId}/hospital/${hospitalId}`);

      return {
        userId,
        hospitalId
      };
    },
    onSuccess: ({ userId, hospitalId }) => {
      queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all });

      queryClient.invalidateQueries({
        queryKey: hospitalAdminKeys.detail(userId)
      });

      queryClient.invalidateQueries({
        queryKey: hospitalAdminKeys.hospital(hospitalId)
      });
    }
  });
}

/**
 * DELETE /hospital-admins/{userId}
 */
export function useDeleteHospitalAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId) => {
      await api.delete(`${HOSPITAL_ADMINS_URL}/${userId}`);
      return userId;
    },
    onSuccess: (userId) => {
      queryClient.invalidateQueries({ queryKey: hospitalAdminKeys.all });

      queryClient.removeQueries({
        queryKey: hospitalAdminKeys.detail(userId)
      });
    }
  });
}

/**
 * GET /hospital-admins/hospital/{hospitalId}
 */
export function useHospitalAdminsByHospital(hospitalId) {
  return useQuery({
    queryKey: hospitalAdminKeys.hospital(hospitalId),
    queryFn: async () => {
      const response = await api.get(`${HOSPITAL_ADMINS_URL}/hospital/${hospitalId}`);

      return response.data;
    },
    enabled: Boolean(hospitalId)
  });
}

/**
 * GET /hospital-admins/{adminId}/hospital/{hospitalId}/access
 */
export function useHospitalAdminAccess(adminId, hospitalId) {
  return useQuery({
    queryKey: hospitalAdminKeys.access(adminId, hospitalId),
    queryFn: async () => {
      const response = await api.get(`${HOSPITAL_ADMINS_URL}/${adminId}/hospital/${hospitalId}/access`);

      return response.data;
    },
    enabled: Boolean(adminId && hospitalId)
  });
}
