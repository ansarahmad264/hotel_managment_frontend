import { apiClient } from "@/config";

// Add orders Api Service
export const GetOrdersApi = async (restauarantId) => {
  try {
    const response = await apiClient.get(`/orders/${restauarantId}`);
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};
