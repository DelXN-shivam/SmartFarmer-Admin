// stores/verifierStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useVerifierStore = create(
  // persist(
    (set, get) => ({
      verifiers: [],
      lastFetched: null,
      loading: false,
      error: null,

      // Fetch all verifiers
      fetchAllVerifiers: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/verifier`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch verifiers')

          const data = await response.json()
          if (data.data) {
            set({ 
              verifiers: data.data,
              lastFetched: Date.now(),
              loading: false 
            })
          }
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      
      // Add a new verifier to the store
      addVerifier: (newVerifier) => {
        set(state => ({
          verifiers: [newVerifier, ...state.verifiers]
        }))
      },


      // Update verifier after verification
      updateVerifier: (verifierId, updates) => {
        set(state => ({
          verifiers: state.verifiers.map(v => 
            v._id === verifierId ? { ...v, ...updates } : v
          )
        }))
      },

      // Check if data needs refreshing
      shouldRefresh: () => {
        const { lastFetched } = get()
        return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
      },

      // Clear store
      clearStore: () => set({ 
        verifiers: [], 
        lastFetched: null 
      })
    }),
    {
      name: 'verifier-storage',
    }
  // )
)