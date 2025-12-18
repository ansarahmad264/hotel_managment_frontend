import { apiClient } from "@/config";

export const SignInApi = async (form) => {
  try {
    const response = await apiClient.post("/signin", form);
    console.log("response--", response);
    return response.data;
  } catch (error) {
    console.log("error--", error);
    return error.response ? error.response.data : null;
  }
};

export const SignUpApi = async (form) => {
  try {
    const response = await apiClient.post("/signup", form);
    console.log("response--", response);
    return response.data;
  } catch (error) {
    console.log("error--", error);
    return error.response ? error.response.data : null;
  }
};

export const SignOutApi = async () => {
  try {
    const response = await apiClient.post("/signout");
    console.log("response--", response);
    return response.data;
  } catch (error) {
    console.log("error--", error);
    return error.response ? error.response.data : null;
  }
};
