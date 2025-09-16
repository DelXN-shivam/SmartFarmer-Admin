// stores/userDataStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useUserDataStore = create(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      role: null,
      token: null,

      // Set user data after login
      setUserData: (data) => {
        set({
          user: data.data,   // API gives "data" as user object
          role: data.role,
          token: data.token,
        });
      },

      // Clear user data (on logout)
      clearUserData: () => {
        set({
          user: null,
          role: null,
          token: null,
        });
      },

      // Helper getter
      isLoggedIn: () => !!get().token,
    }),
    {
      name: "user-data-storage", // Key in localStorage
    }
  )
);
