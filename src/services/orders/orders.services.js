import { apiClient } from "@/config";

// Add orders Api Service
export const GetOrdersApi = async () => {
  try {
    const response = await apiClient.get(`/order/restaurant`);
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};

// Update orders Api Service
export const UpdateOrderApi = async (orderId, status) => {
  try {
    const response = await apiClient.patch(
      `/order/restaurant/${orderId}/status`,
      status
    );
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};
