/* eslint-disable no-unused-vars */
import { propertyService } from "@/api/properties";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-toastify";

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

export const useUpdateProperty = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  return useMutation({
    mutationFn: async ({ id, data, images }) => {
      const formData = new FormData();

      // Append images if they exist
      images?.forEach((image) => {
        formData.append("images", image);
      });

      // Prepare and append all property data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (typeof value === "object" && !(value instanceof File)) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      const res = await axios.put(
        `http://localhost:5000/api/properties/${id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        }
      );
      return res.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["property", id]);
      queryClient.invalidateQueries(["myProperties"]);
      toast.success("Property updated successfully!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message ||
          "Failed to update property. Please check your data and try again."
      );
    },
    onSettled: () => {
      setUploadProgress(0);
    },
  });
};

export const useDeleteProperty = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => propertyService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["properties"]);
      queryClient.invalidateQueries(["host-properties"]);
    },
  });
};

export const useUploadPropertyImages = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, images }) => propertyService.uploadImages(id, images),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["property", id]);
    },
  });
};

export const useSetPrimaryImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }) =>
      propertyService.setPrimaryImage(id, imageId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["property", id]);
    },
  });
};

export const useDeletePropertyImage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, imageId }) => propertyService.deleteImage(id, imageId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries(["property", id]);
    },
  });
};
