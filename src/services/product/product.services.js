import { apiClient } from "@/config";

// Add Product Api Service
export const AddProductApi = async (id, form) => {
  try {
    const response = await apiClient.post(`/restaurant/add-item/${id}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};

// Add Product Api Service
export const GetProductsApi = async (restauarantId, limit) => {
  try {
    let endpoint = `/restaurant/products/${restauarantId}`;
    if (limit) {
      endpoint += `?limit=${limit}`;
    }
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};

// Add Product Api Service
export const GetProductApi = async (id, restauarantId) => {
  try {
    const response = await apiClient.get(
      `/restaurant/product/${id}/${restauarantId}`
    );
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};

// Add Product Api Service
export const DeleteProductApi = async (id) => {
  try {
    const response = await apiClient.delete(`/restaurant/delete/${id}`);
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};

// Add Product Api Service
export const UpdateProductApi = async (id, form) => {
  try {
    const response = await apiClient.put(`/restaurant/update-item/${id}`, form);
    return response.data;
  } catch (error) {
    return error.response ? error.response.data : null;
  }
};
