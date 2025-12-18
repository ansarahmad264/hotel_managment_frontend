import { apiClient } from "@/config";
import React from "react";

// Get Users
export const GetUsersApi = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}`);
    console.log("response--", response);
    return response.data;
  } catch (error) {
    console.log("error--", error);
    return error.response ? error.response.data : null;
  }
};

// Get Users
export const DeleteUsersApi = async (id) => {
  try {
    const response = await apiClient.delete(`/users/${id}`);
    console.log("response--", response);
    return response.data;
  } catch (error) {
    console.log("error--", error);
    return error.response ? error.response.data : null;
  }
};
