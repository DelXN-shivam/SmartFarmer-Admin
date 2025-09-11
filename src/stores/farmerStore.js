// stores/farmerStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useFarmerStore = create(
  persist(
    (set, get) => ({
      farmers: [],
      crops: [],
      lastFetched: null,
      loading: false,
      error: null,

      // Fetch all farmers
      fetchAllFarmers: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/farmer`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch farmers')

          const data = await response.json()
          if (data.data) {
            set({ 
              farmers: data.data,
              lastFetched: Date.now(),
              loading: false 
            })
            
            // Fetch crops data in background
            const allCropIds = data.data.flatMap(farmer => farmer.crops || [])
            if (allCropIds.length > 0) {
              get().fetchCrops(token, BASE_URL, allCropIds)
            }
          }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Fetch crops by IDs
      fetchCrops: async (token, BASE_URL, cropIds) => {
        try {
          const response = await fetch(`${BASE_URL}/api/crop/get-by-ids`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: cropIds })
          })

          if (response.ok) {
            const data = await response.json()
            if (data.crops) {
              set({ crops: data.crops })
            }
          }
        } catch (error) {
          console.error('Error fetching crops:', error)
        }
      },

      // Check if data needs refreshing
      shouldRefresh: () => {
        const { lastFetched } = get()
        return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
      },

      // Clear store
      clearStore: () => set({ 
        farmers: [], 
        crops: [], 
        lastFetched: null 
      })
    }),
    {
      name: 'farmer-storage',
    }
  )
)