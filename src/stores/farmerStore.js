// stores/farmerStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { useCropStore } from "./cropStore";

export const useFarmerStore = create(
  persist(
    (set, get) => ({
      farmersData: {}, // farmers keyed by _id
      lastFetched: null,
      loading: false,
      error: null,

      // ✅ FIXED: Fetch all farmers from API
      fetchAllFarmers: async (token, BASE_URL) => {
        set({ loading: true, error: null });
        try {
          console.log("🌐 Fetching farmers from:", `${BASE_URL}/api/farmer`);
          
          const res = await axios.get(`${BASE_URL}/api/farmer`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          console.log("📦 Farmer API Response:", res.data);
          
          // ✅ FIX: Handle different response formats
          let farmersArray = [];
          
          if (Array.isArray(res.data)) {
            // Case 1: Direct array response
            farmersArray = res.data;
          } else if (Array.isArray(res.data?.data)) {
            // Case 2: {data: [], message: ""} format
            farmersArray = res.data.data;
          } else if (res.data?.farmers && Array.isArray(res.data.farmers)) {
            // Case 3: {farmers: []} format
            farmersArray = res.data.farmers;
          } else {
            throw new Error("Invalid API response format");
          }
          
          console.log("✅ Farmers array length:", farmersArray.length);

          // Transform array to object keyed by _id
          const farmersObj = {};
          farmersArray.forEach((f) => {
            if (f && f._id) {
              farmersObj[f._id] = f;
            }
          });

          console.log("💾 Farmers object keys:", Object.keys(farmersObj).length);
          
          set({
            farmersData: farmersObj,
            lastFetched: Date.now(),
            loading: false,
          });
          
        } catch (err) {
          console.error("❌ Failed to fetch farmers:", err);
          set({ 
            error: err.response?.data?.message || "Failed to fetch farmers", 
            loading: false 
          });
        }
      },

      // Check if data should refresh (10 min rule)
      shouldRefresh: () => {
        const last = get().lastFetched;
        return !last || Date.now() - last > 10 * 60 * 1000;
      },

      // Sync farmers from crops in cropStore
      syncFarmersFromCrops: () => {
        const { crops } = useCropStore.getState();
        if (!crops || !crops.length) return;

        const currentFarmers = get().farmersData;
        const farmersMap = {};
        let hasNew = false;

        crops.forEach((c) => {
          if (c.farmerId && !currentFarmers[c.farmerId]) {
            farmersMap[c.farmerId] = { 
              _id: c.farmerId, 
              name: "Unknown", 
              village: "Unknown",
              district: c.district || "Unknown",
              taluka: c.taluka || "Unknown"
            };
            hasNew = true;
          }
        });

        if (hasNew) {
          set({ farmersData: { ...currentFarmers, ...farmersMap } });
        }
      },

      // Clear the store
      clearStore: () => {
        set({
          farmersData: {},
          lastFetched: null,
          loading: false,
          error: null,
        });
        // Clear from localStorage as well
        localStorage.removeItem('farmer-storage');
      },
    }),
    {
      name: "farmer-storage",
      getStorage: () => localStorage,
    }
  )
);

























// // stores/farmerStore.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import axios from "axios";
// import { useCropStore } from "./cropStore"; // ⬅️ Import cropStore to sync farmers

// export const useFarmerStore = create(
//   persist(
//     (set, get) => ({
//       farmersData: {}, // farmers keyed by _id
//       lastFetched: null,
//       loading: false,
//       error: null,

//       // Fetch all farmers from API
//       fetchAllFarmers: async (token, BASE_URL) => {
//         set({ loading: true, error: null });
//         try {
//           const res = await axios.get(`${BASE_URL}/api/farmer`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           const data = res.data; // assume array of farmers

//           // Transform array to object keyed by _id
//           const farmersObj = {};
//           data.forEach((f) => (farmersObj[f._id] = f));

//           set({
//             farmersData: farmersObj,
//             lastFetched: Date.now(),
//             loading: false,
//           });
//         } catch (err) {
//           console.error("Failed to fetch farmers:", err);
//           set({ error: "Failed to fetch farmers", loading: false });
//         }
//       },

//       // Check if data should refresh (10 min rule)
//       shouldRefresh: () => {
//         const last = get().lastFetched;
//         return !last || Date.now() - last > 10 * 60 * 1000;
//       },

//       // Sync farmers from crops in cropStore
//       syncFarmersFromCrops: () => {
//   const { crops } = useCropStore.getState();
//   if (!crops || !crops.length) return;

//   const currentFarmers = get().farmersData;
//   const farmersMap = {};
//   let hasNew = false;

//   crops.forEach((c) => {
//     if (c.farmerId && !currentFarmers[c.farmerId]) {
//       farmersMap[c.farmerId] = { _id: c.farmerId, name: "Unknown", village: "Unknown" };
//       hasNew = true;
//     }
//   });

//   if (hasNew) {
//     set({ farmersData: { ...currentFarmers, ...farmersMap } });
//   }
// },



//       // Clear the store
//       clearStore: () =>
//         set({
//           farmersData: {},
//           lastFetched: null,
//           loading: false,
//           error: null,
//         }),
//     }),
//     {
//       name: "farmer-storage", // localStorage key
//       getStorage: () => localStorage,
//     }
//   )
// );










// // stores/farmerStore.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import axios from "axios";
// import { useCropStore } from "./cropStore"; // ⬅️ Import cropStore to sync farmers

// export const useFarmerStore = create(
//   persist(
//     (set, get) => ({
//       farmersData: {}, // farmers keyed by _id
//       lastFetched: null,
//       loading: false,
//       error: null,

//       // Fetch all farmers from API
//       fetchAllFarmers: async (token, BASE_URL) => {
//         set({ loading: true, error: null });
//         try {
//           const res = await axios.get(`${BASE_URL}/api/farmers`, {
//             headers: { Authorization: `Bearer ${token}` },
//           });
//           const data = res.data; // assume array of farmers

//           // Transform array to object keyed by _id
//           const farmersObj = {};
//           data.forEach((f) => (farmersObj[f._id] = f));

//           set({
//             farmersData: farmersObj,
//             lastFetched: Date.now(),
//             loading: false,
//           });
//         } catch (err) {
//           console.error("Failed to fetch farmers:", err);
//           set({ error: "Failed to fetch farmers", loading: false });
//         }
//       },

//       // Check if data should refresh (10 min rule)
//       shouldRefresh: () => {
//         const last = get().lastFetched;
//         return !last || Date.now() - last > 10 * 60 * 1000;
//       },

//       // Sync farmers from crops in cropStore
//       syncFarmersFromCrops: () => {
//   const { crops } = useCropStore.getState();
//   if (!crops || !crops.length) return;

//   const currentFarmers = get().farmersData;
//   const farmersMap = {};
//   let hasNew = false;

//   crops.forEach((c) => {
//     if (c.farmerId && !currentFarmers[c.farmerId]) {
//       farmersMap[c.farmerId] = { _id: c.farmerId, name: "Unknown", village: "Unknown" };
//       hasNew = true;
//     }
//   });

//   if (hasNew) {
//     set({ farmersData: { ...currentFarmers, ...farmersMap } });
//   }
// },



//       // Clear the store
//       clearStore: () =>
//         set({
//           farmersData: {},
//           lastFetched: null,
//           loading: false,
//           error: null,
//         }),
//     }),
//     {
//       name: "farmer-storage", // localStorage key
//       getStorage: () => localStorage,
//     }
//   )
// );



















// // stores/farmerStore.js
// import { create } from "zustand";
// import { persist } from "zustand/middleware";
// import { useCropStore } from "./cropStore";

// export const useFarmerStore = create(
//   persist(
//     (set, get) => ({
//       farmers: [], // bas wahi farmers jinke paas crops hai
//       lastSynced: null,

//       // farmers ko cropStore se sync karna
//       syncFarmersFromCrops: () => {
//         const { crops, farmersData } = useCropStore.getState();

//         // crops ke through farmerIds nikal lo
//         const farmerIdsWithCrops = [...new Set(crops.map(c => c.farmerId))];
//         const farmers = farmerIdsWithCrops
//           .map(id => farmersData[id])
//           .filter(Boolean);

//         set({
//           farmers,
//           lastSynced: Date.now(),
//         });
//       },

//       clearStore: () =>
//         set({
//           farmers: [],
//           lastSynced: null,
//         }),
//     }),
//     {
//       name: "farmer-storage",
//     }
//   )
// );



















// // stores/farmerStore.js
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// export const useFarmerStore = create(
//   persist(
//     (set, get) => ({
//       farmers: [],
//       crops: [],
//       lastFetched: null,
//       loading: false,
//       error: null,

//       // Fetch all farmers
//       fetchAllFarmers: async (token, BASE_URL) => {
//         set({ loading: true, error: null })
//         try {
//           const response = await fetch(`${BASE_URL}/api/farmer`, {
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           })

//           if (!response.ok) throw new Error('Failed to fetch farmers')

//           const data = await response.json()
//           if (data.data) {
//             set({ 
//               farmers: data.data,
//               lastFetched: Date.now(),
//               loading: false 
//             })
            
//             // Fetch crops data in background
//             const allCropIds = data.data.flatMap(farmer => farmer.crops || [])
//             if (allCropIds.length > 0) {
//               get().fetchCrops(token, BASE_URL, allCropIds)
//             }
//           }
//         } catch (error) {
//           set({ 
//             error: error.message, 
//             loading: false 
//           })
//           throw error
//         }
//       },

//       // Fetch crops by IDs
//       fetchCrops: async (token, BASE_URL, cropIds) => {
//         try {
//           const response = await fetch(`${BASE_URL}/api/crop/get-by-ids`, {
//             method: 'POST',
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({ ids: cropIds })
//           })

//           if (response.ok) {
//             const data = await response.json()
//             if (data.crops) {
//               set({ crops: data.crops })
//             }
//           }
//         } catch (error) {
//           console.error('Error fetching crops:', error)
//         }
//       },

//       // Check if data needs refreshing
//       shouldRefresh: () => {
//         const { lastFetched } = get()
//         return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
//       },

//       // Clear store
//       clearStore: () => set({ 
//         farmers: [], 
//         crops: [], 
//         lastFetched: null 
//       })
//     }),
//     {
//       name: 'farmer-storage',
//     }
//   )
// )
