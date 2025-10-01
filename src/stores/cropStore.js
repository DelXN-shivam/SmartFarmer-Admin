
// stores/cropStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUserDataStore } from "./userDataStore";
import { useFarmerStore } from "./farmerStore"; // ⬅️ farmerStore import

export const useCropStore = create(
  persist(
    (set, get) => ({
      crops: [],
      farmersData: {},
      verifiersData: {},
      lastFetched: null,
      loading: false,
      error: null,

      // Fetch additional data (farmers and verifiers)
      fetchAdditionalData: async (token, BASE_URL, crops) => {
        try {
          const farmerIds = [
            ...new Set(
              crops
                .map((c) => c.farmerId)
                .filter((id) => id && !get().farmersData[id])
            ),
          ];
          const verifierIds = [
            ...new Set(
              crops
                .map((c) => c.verifierId)
                .filter((id) => id && !get().verifiersData[id])
            ),
          ];

          // Fetch farmers
          if (farmerIds.length > 0) {
            const farmersResponse = await fetch(
              `${BASE_URL}/api/farmer/by-ids`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: farmerIds }),
              }
            );

            if (farmersResponse.ok) {
              const farmersData = await farmersResponse.json();
              if (farmersData.data) {
                const farmersMap = {};
                farmersData.data.forEach((f) => {
                  farmersMap[f._id] = f;
                });
                set((state) => ({
                  farmersData: { ...state.farmersData, ...farmersMap },
                }));
              }
            }
          }

          // Fetch verifiers
          if (verifierIds.length > 0) {
            const verifiersResponse = await fetch(
              `${BASE_URL}/api/verifier/by-ids`,
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ ids: verifierIds }),
              }
            );

            if (verifiersResponse.ok) {
              const verifiersData = await verifiersResponse.json();
              if (verifiersData.data) {
                const verifiersMap = {};
                verifiersData.data.forEach((v) => {
                  verifiersMap[v._id] = v;
                });
                set((state) => ({
                  verifiersData: { ...state.verifiersData, ...verifiersMap },
                }));
              }
            }
          }
        } catch (error) {
          console.error("Error fetching additional data:", error);
        }
      },

      // Check if data needs refreshing
      shouldRefresh: () => {
        const { lastFetched } = get();
        return !lastFetched || Date.now() - lastFetched > 10 * 60 * 1000;
      },

      // cropStore.js - YE FUNCTION ADD KARO
      fetchAllCrops: async (token, BASE_URL) => {
        set({ loading: true, error: null });
        try {
          console.log(
            "🌐 Fetching ALL crops from:",
            `${BASE_URL}/api/crop/all`
          );

          const response = await fetch(`${BASE_URL}/api/crop/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) throw new Error("Failed to fetch all crops");

          const data = await response.json();
          console.log("✅ All crops response:", data);

          // ✅ Handle different response formats
          let cropsArray = [];

          if (Array.isArray(data)) {
            cropsArray = data;
          } else if (Array.isArray(data?.data)) {
            cropsArray = data.data;
          } else if (data?.crops && Array.isArray(data.crops)) {
            cropsArray = data.crops;
          } else {
            throw new Error("Invalid crops response format");
          }

          console.log("📦 Total crops received:", cropsArray.length);

          set({
            crops: cropsArray,
            lastFetched: Date.now(),
            loading: false,
          });

          // ✅ Fetch additional data for all crops
          await get().fetchAdditionalData(token, BASE_URL, cropsArray);
        } catch (error) {
          console.error("❌ Error fetching all crops:", error);
          set({
            error: error.message,
            loading: false,
          });
          throw error;
        }
      },

      // Clear store
      clearStore: () =>
        set({
          crops: [],
          farmersData: {},
          verifiersData: {},
          lastFetched: null,
        }),
    }),
    { name: "crop-storage" }
  )
);
