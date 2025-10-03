// stores/verifierStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useUserDataStore } from './userDataStore'

export const useVerifierStore = create(
  persist(
    (set, get) => ({
      verifiers: [],
      lastFetched: null,
      loading: false,
      error: null,

      // Fetch verifiers by IDs from userDataStore
      fetchVerifiersByIds: async (BASE_URL) => {
        const { user, token } = useUserDataStore.getState()
        const ids = user?.verifierId || []

        if (!ids.length) {
          set({ verifiers: [], lastFetched: Date.now() })
          return
        }

        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/verifier/by-ids`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
          })

          if (!response.ok) throw new Error('Failed to fetch verifiers by IDs')

          const data = await response.json()
          if (data.data) {
            set({
              verifiers: data.data,
              lastFetched: Date.now(),
              loading: false
            })
          }
        } catch (error) {
          set({ error: error.message, loading: false })
          throw error
        }
      },

      // Fetch all verifiers
      // In your verifierStore.js, update fetchAllVerifiers:
    fetchAllVerifiers: async (token, BASE_URL) => {
      set({ loading: true, error: null })
      try {
        console.log("🌐 API Call: Fetching ALL verifiers from:", `${BASE_URL}/api/verifier`);
        
        const response = await fetch(`${BASE_URL}/api/verifier`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("📡 Response status:", response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        console.log("✅ API Success - Total verifiers received:", data.data?.length);
        console.log("📦 Data structure:", data);
        
        if (data.data && Array.isArray(data.data)) {
          set({ 
            verifiers: data.data,
            lastFetched: Date.now(),
            loading: false 
          })
          console.log("💾 Store updated successfully with", data.data.length, "verifiers");
        } else {
          console.warn("⚠️ Unexpected data format:", data);
          throw new Error('Invalid data format received from API')
        }
      } catch (error) {
        console.error("❌ Store Error:", error)
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
      clearStore: () => {
        set({ 
          verifiers: [], 
          lastFetched: null,
          loading: false,
          error: null
        });
        // Clear from localStorage as well
        localStorage.removeItem('verifier-storage');
      }
    }),
    { name: 'verifier-storage' }
  )
)





// // stores/verifierStore.js
// import { create } from 'zustand'
// import { persist } from 'zustand/middleware'

// export const useVerifierStore = create(
//   // persist(
//     (set, get) => ({
//       verifiers: [],
//       lastFetched: null,
//       loading: false,
//       error: null,

      // // Fetch all verifiers
      // fetchAllVerifiers: async (token, BASE_URL) => {
      //   set({ loading: true, error: null })
      //   try {
      //     const response = await fetch(`${BASE_URL}/api/verifier`, {
      //       headers: {
      //         Authorization: `Bearer ${token}`,
      //         "Content-Type": "application/json",
      //       },
      //     })

      //     if (!response.ok) throw new Error('Failed to fetch verifiers')

      //     const data = await response.json()
      //     if (data.data) {
      //       set({ 
      //         verifiers: data.data,
      //         lastFetched: Date.now(),
      //         loading: false 
      //       })
      //     }
      //   } catch (error) {
      //     set({ 
      //       error: error.message, 
      //       loading: false 
      //     })
      //     throw error
      //   }
      // },

      
//       // Add a new verifier to the store
//       addVerifier: (newVerifier) => {
//         set(state => ({
//           verifiers: [newVerifier, ...state.verifiers]
//         }))
//       },


//       // Update verifier after verification
//       updateVerifier: (verifierId, updates) => {
//         set(state => ({
//           verifiers: state.verifiers.map(v => 
//             v._id === verifierId ? { ...v, ...updates } : v
//           )
//         }))
//       },

//       // Check if data needs refreshing
//       shouldRefresh: () => {
//         const { lastFetched } = get()
//         return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
//       },

//       // Clear store
//       clearStore: () => set({ 
//         verifiers: [], 
//         lastFetched: null 
//       })
//     }),
//     {
//       name: 'verifier-storage',
//     }
//   // )
// )