import { SignOutApi } from "@/services/auth/auth.services";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// auth store
export const useAuthStore = create()(
  persist(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) => {
        set(() => ({
          user: user,
          isAuthenticated: true,
        }));
      },

      logout: async () => {
        const response = await SignOutApi();
        console.log("response--in signout store--", response);
        // success
        if (response?.success) {
          set(() => {
            return {
              user: null,
              isAuthenticated: false,
            };
          });
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
