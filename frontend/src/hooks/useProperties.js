import { propertyService } from "@/api/properties";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const useProperties = (filters = {}) => {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: () => propertyService.getAll(filters),
  });
};

export const useHostProperties = (hostId) => {
  return useQuery({
    queryKey: ["host-properties", hostId],
    queryFn: () => propertyService.getByHostId(hostId),
    enabled: !!hostId,
    onError: (error) => {
      console.error(
        `Error fetching properties for host ${hostId}:`,
        error.message
      );
    },
  });
};

export const useProperty = (id) => {
  return useQuery({
    queryKey: ["property", id],
    queryFn: () => propertyService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyService.create,
    onSuccess: () => {
      queryClient.invalidateQueries(["properties"]);
    },
  });
};

export const useUpdateProperty = (id) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => propertyService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["properties"]);
      queryClient.invalidateQueries(["property", id]);
    },
  });
};

export const useDeleteProperty = (deleteSuccess, deleteError) => {
  //   const queryClient = useQueryClient();
  return useMutation({
    mutationFn: propertyService.delete,
    onSuccess: deleteSuccess,
    onError: deleteError,
  });
};
