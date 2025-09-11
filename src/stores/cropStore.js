// stores/cropStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useCropStore = create(
  persist(
    (set, get) => ({
      crops: [],
      farmersData: {},
      verifiersData: {},
      lastFetched: null,
      loading: false,
      error: null,

      // Fetch all crops
      fetchAllCrops: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/crop/all`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch crops')

          const data = await response.json()
          if (data.crops) {
            set({ 
              crops: data.crops,
              lastFetched: Date.now(),
              loading: false 
            })
            
            // Fetch additional data in background
            get().fetchAdditionalData(token, BASE_URL, data.crops)
          }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Fetch additional data (farmers and verifiers)
      fetchAdditionalData: async (token, BASE_URL, crops) => {
        try {
          // Extract unique IDs
          const farmerIds = [...new Set(crops
            .map(crop => crop.farmerId)
            .filter(id => id && !get().farmersData[id]))]

          const verifierIds = [...new Set(crops
            .map(crop => crop.verifierId)
            .filter(id => id && !get().verifiersData[id]))]

          // Fetch farmers data
          if (farmerIds.length > 0) {
            const farmersResponse = await fetch(`${BASE_URL}/api/farmer/by-ids`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ids: farmerIds })
            })
            
            if (farmersResponse.ok) {
              const farmersData = await farmersResponse.json()
              if (farmersData.data) {
                const farmersMap = {}
                farmersData.data.forEach(farmer => {
                  farmersMap[farmer._id] = farmer
                })
                set(state => ({
                  farmersData: { ...state.farmersData, ...farmersMap }
                }))
              }
            }
          }

          // Fetch verifiers data
          if (verifierIds.length > 0) {
            const verifiersResponse = await fetch(`${BASE_URL}/api/verifier/by-ids`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ ids: verifierIds })
            })
            
            if (verifiersResponse.ok) {
              const verifiersData = await verifiersResponse.json()
              if (verifiersData.data) {
                const verifiersMap = {}
                verifiersData.data.forEach(verifier => {
                  verifiersMap[verifier._id] = verifier
                })
                set(state => ({
                  verifiersData: { ...state.verifiersData, ...verifiersMap }
                }))
              }
            }
          }
        } catch (error) {
          console.error('Error fetching additional data:', error)
        }
      },

      // Check if data needs refreshing (e.g., every 5 minutes)
      shouldRefresh: () => {
        const { lastFetched } = get()
        return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
      },

      // Clear store
      clearStore: () => set({ 
        crops: [], 
        farmersData: {}, 
        verifiersData: {}, 
        lastFetched: null 
      })
    }),
    {
      name: 'crop-storage',
    }
  )
)