import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

const ADDRESSES_URL = '/addresses';

export const addressKeys = {
  all: ['addresses'],
  lists: () => [...addressKeys.all, 'list'],
  detail: (id) => [...addressKeys.all, 'detail', id]
};

/**
 * POST /addresses
 */
export function useCreateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.post(ADDRESSES_URL, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    }
  });
}

/**
 * GET /addresses
 */
export function useAddresses() {
  return useQuery({
    queryKey: addressKeys.lists(),
    queryFn: async () => {
      const response = await api.get(ADDRESSES_URL);
      return response.data;
    }
  });
}

/**
 * GET /addresses/{id}
 */
export function useAddress(id) {
  return useQuery({
    queryKey: addressKeys.detail(id),
    queryFn: async () => {
      const response = await api.get(`${ADDRESSES_URL}/${id}`);
      return response.data;
    },
    enabled: Boolean(id)
  });
}

/**
 * PATCH /addresses/{id}
 */
export function useUpdateAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }) => {
      const response = await api.patch(`${ADDRESSES_URL}/${id}`, payload);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: addressKeys.detail(variables.id)
        });
      }
    }
  });
}

/**
 * DELETE /addresses/{id}
 */
export function useDeleteAddress() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      await api.delete(`${ADDRESSES_URL}/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressKeys.all });
    }
  });
}
