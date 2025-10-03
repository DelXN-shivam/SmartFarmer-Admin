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
      setUserData: (payload) => {
        if (!payload) {
          // Handle null (logout)
          set({
            user: null,
            role: null,
            token: null,
          });
          return;
        }

        set({
          user: payload.data,  // 👈 API gives "data" as the user object
          role: payload.role,
          token: payload.token,
        });
      },

      // Append a newly created verifier ID to the logged-in user's profile in-place
      addVerifierId: (verifierId) => {
        const current = get().user;
        if (!current || !verifierId) return;
        const existing = Array.isArray(current.verifierId) ? current.verifierId : [];
        if (existing.includes(verifierId)) return;
        set({
          user: { ...current, verifierId: [verifierId, ...existing] },
        });
      },

      // Clear user data (on logout)
      clearUserData: () => {
        set({
          user: null,
          role: null,
          token: null,
        });
        // Clear from localStorage as well
        localStorage.removeItem('user-data-storage');
      },

      // Helper getter
      isLoggedIn: () => !!get().token,
    }),
    {
      name: "user-data-storage",
    }
  )
);















// // stores/userDataStore.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";

// export const useUserDataStore = create(
//   persist(
//     (set, get) => ({
//       // Initial state
//       user: null,
//       role: null,
//       token: null,

//       // Set user data after login
//       setUserData: (data) => {
//         set({
//           user: data, // API gives "data" as user object
//           role: data.role,
//           token: data.token,
//         });
//       },

//       // Clear user data (on logout)
//       clearUserData: () => {
//         set({
//           user: null,
//           role: null,
//           token: null,
//         });
//       },

//       // Helper getter
//       isLoggedIn: () => !!get().token,
//     }),
//     {
//       name: "user-data-storage",
//     }
//   )
// );
