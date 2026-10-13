import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

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

export function createCrudHooks(resourceName, resourceUrl, defaultSort = 'createdAt,asc') {
  const keys = {
    all: [resourceName],
    list: (params) => [resourceName, 'list', params],
    detail: (id) => [resourceName, 'detail', id]
  };

  function useList(params = {}) {
    const { page = 0, size = 10, sort = defaultSort } = params;
    const queryParams = { page, size, ...(sort ? { sort } : {}) };

    const query = useQuery({
      queryKey: keys.list(queryParams),
      queryFn: async () => {
        const response = await api.get(resourceUrl, { params: queryParams });
        return response.data;
      },
      keepPreviousData: true
    });

    return {
      ...query,
      items: getItemsFromPayload(query.data),
      [resourceName]: getItemsFromPayload(query.data),
      totalElements: getTotalElements(query.data),
      mutate: query.refetch
    };
  }

  function useDetail(id) {
    return useQuery({
      queryKey: keys.detail(id),
      queryFn: async () => {
        const response = await api.get(`${resourceUrl}/${id}`);
        return response.data;
      },
      enabled: Boolean(id)
    });
  }

  function useCreate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (payload) => {
        const response = await api.post(resourceUrl, payload);
        return response.data;
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.all })
    });
  }

  function useUpdate() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async ({ id, payload }) => {
        const response = await api.patch(`${resourceUrl}/${id}`, payload);
        return response.data;
      },
      onSuccess: (data, variables) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        if (variables?.id) queryClient.invalidateQueries({ queryKey: keys.detail(variables.id) });
      }
    });
  }

  function useDelete() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (id) => {
        await api.delete(`${resourceUrl}/${id}`);
        return id;
      },
      onSuccess: (id) => {
        queryClient.invalidateQueries({ queryKey: keys.all });
        queryClient.removeQueries({ queryKey: keys.detail(id) });
      }
    });
  }

  return { keys, useList, useDetail, useCreate, useUpdate, useDelete };
}
