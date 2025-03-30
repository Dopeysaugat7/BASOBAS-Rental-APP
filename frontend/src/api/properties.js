import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api/",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Helper to prepare FormData
const toFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined) return;
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

export const propertyService = {
  getAll: async (filters = {}) => {
    const { data } = await api.get("/properties", { params: filters });
    return data;
  },
  getById: async (id) => {
    const { data } = await api.get(`/properties/${id}`);
    return data;
  },
  getByHostId: async (hostId) => {
    const { data } = await api.get(`/properties/host/${hostId}`);
    return data;
  },
  create: async (propertyData) => {
    const { data } = await api.post("/properties", propertyData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  update: async (id, data) => {
    const formData = toFormData(data);
    const res = await api.patch(`/properties/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  delete: async (id) => {
    await api.delete(`/properties/${id}`);
  },
  uploadImages: async (id, images) => {
    const formData = new FormData();
    images.forEach((image) => formData.append("images", image));
    const { data } = await api.put(`/properties/${id}/images`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  setPrimaryImage: async (id, imageId) => {
    const { data } = await api.put(`/properties/${id}/primary-image`, {
      imageId,
    });
    return data;
  },
  deleteImage: async (id, imageId) => {
    await api.delete(`/properties/${id}/images/${imageId}`);
  },
};
