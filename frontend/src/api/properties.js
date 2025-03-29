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
  update: async (id, propertyData) => {
    const { data } = await api.patch(`/properties/${id}`, propertyData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  delete: async (id) => {
    await api.delete(`/properties/${id}`);
  },
};
