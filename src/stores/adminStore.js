// stores/adminStore.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAdminStore = create(
  persist(
    (set, get) => ({
      // State for all roles
      superAdmins: [],
      talukaOfficers: [],
      districtOfficers: [],
      lastFetched: null,
      loading: false,
      error: null,

      // ==================== SUPER ADMIN METHODS ====================
      
      // Fetch all super admins
      fetchAllSuperAdmins: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/superadmin`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch super admins')

          const data = await response.json()
          if (data.data) {
            set({ 
              superAdmins: data.data,
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

      // Fetch super admin by ID
      fetchSuperAdminById: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/superadmin/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch super admin')

          const data = await response.json()
          set({ loading: false })
          return data.data
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Create new super admin
      createSuperAdmin: async (token, BASE_URL, superAdminData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/superadmin`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(superAdminData)
          })

          if (!response.ok) throw new Error('Failed to create super admin')

          const data = await response.json()
          const newSuperAdmin = data.data
          
          set(state => ({
            superAdmins: [...state.superAdmins, newSuperAdmin],
            loading: false
          }))
          
          return newSuperAdmin
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Update super admin
      updateSuperAdmin: async (token, BASE_URL, id, updateData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/superadmin/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) throw new Error('Failed to update super admin')

          const data = await response.json()
          const updatedSuperAdmin = data.data
          
          set(state => ({
            superAdmins: state.superAdmins.map(admin => 
              admin._id === id ? updatedSuperAdmin : admin
            ),
            loading: false
          }))
          
          return updatedSuperAdmin
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Delete super admin
      deleteSuperAdmin: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/superadmin/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to delete super admin')

          set(state => ({
            superAdmins: state.superAdmins.filter(admin => admin._id !== id),
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // ==================== TALUKA OFFICER METHODS ====================

      // Fetch all taluka officers
      fetchAllTalukaOfficers: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch taluka officers')

          const data = await response.json()
          if (data.data) {
            set({ 
              talukaOfficers: data.data,
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

      // Fetch taluka officer by ID
      fetchTalukaOfficerById: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch taluka officer')

          const data = await response.json()
          set({ loading: false })
          return data.data
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Create new taluka officer
      createTalukaOfficer: async (token, BASE_URL, officerData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(officerData)
          })

          if (!response.ok) throw new Error('Failed to create taluka officer')

          const data = await response.json()
          const newOfficer = data.data
          
          set(state => ({
            talukaOfficers: [...state.talukaOfficers, newOfficer],
            loading: false
          }))
          
          return newOfficer
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Update taluka officer
      updateTalukaOfficer: async (token, BASE_URL, id, updateData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) throw new Error('Failed to update taluka officer')

          const data = await response.json()
          const updatedOfficer = data.data
          
          set(state => ({
            talukaOfficers: state.talukaOfficers.map(officer => 
              officer._id === id ? updatedOfficer : officer
            ),
            loading: false
          }))
          
          return updatedOfficer
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Delete taluka officer
      deleteTalukaOfficer: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to delete taluka officer')

          set(state => ({
            talukaOfficers: state.talukaOfficers.filter(officer => officer._id !== id),
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Fetch officers by district
      fetchTalukaOfficersByDistrict: async (token, BASE_URL, district) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/taluka-officer/district/${district}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch officers by district')

          const data = await response.json()
          set({ 
            talukaOfficers: data.data,
            lastFetched: Date.now(),
            loading: false 
          })
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // ==================== DISTRICT OFFICER METHODS ====================

      // Fetch all district officers
      fetchAllDistrictOfficers: async (token, BASE_URL) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch district officers')

          const data = await response.json()
          if (data.data) {
            set({ 
              districtOfficers: data.data,
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

      // Fetch district officer by ID
      fetchDistrictOfficerById: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch district officer')

          const data = await response.json()
          set({ loading: false })
          return data.data
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Create new district officer
      createDistrictOfficer: async (token, BASE_URL, officerData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(officerData)
          })

          if (!response.ok) throw new Error('Failed to create district officer')

          const data = await response.json()
          const newOfficer = data.data
          
          set(state => ({
            districtOfficers: [...state.districtOfficers, newOfficer],
            loading: false
          }))
          
          return newOfficer
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Update district officer
      updateDistrictOfficer: async (token, BASE_URL, id, updateData) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer/${id}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updateData)
          })

          if (!response.ok) throw new Error('Failed to update district officer')

          const data = await response.json()
          const updatedOfficer = data.data
          
          set(state => ({
            districtOfficers: state.districtOfficers.map(officer => 
              officer._id === id ? updatedOfficer : officer
            ),
            loading: false
          }))
          
          return updatedOfficer
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Delete district officer
      deleteDistrictOfficer: async (token, BASE_URL, id) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to delete district officer')

          set(state => ({
            districtOfficers: state.districtOfficers.filter(officer => officer._id !== id),
            loading: false
          }))
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // Fetch officers by state
      fetchDistrictOfficersByState: async (token, BASE_URL, state) => {
        set({ loading: true, error: null })
        try {
          const response = await fetch(`${BASE_URL}/api/district-officer/state/${state}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (!response.ok) throw new Error('Failed to fetch officers by state')

          const data = await response.json()
          set({ 
            districtOfficers: data.data,
            lastFetched: Date.now(),
            loading: false 
          })
        } catch (error) {
          set({ 
            error: error.message, 
            loading: false 
          })
          throw error
        }
      },

      // ==================== COMMON METHODS ====================

      // Fetch all data for a specific role
      fetchAllByRole: async (token, BASE_URL, role) => {
        switch (role) {
          case 'superAdmin':
            return await get().fetchAllSuperAdmins(token, BASE_URL)
          case 'talukaOfficer':
            return await get().fetchAllTalukaOfficers(token, BASE_URL)
          case 'districtOfficer':
            return await get().fetchAllDistrictOfficers(token, BASE_URL)
          default:
            throw new Error('Invalid role')
        }
      },

      // Get user by ID and role
      getUserById: (id, role) => {
        const state = get()
        switch (role) {
          case 'superAdmin':
            return state.superAdmins.find(user => user._id === id)
          case 'talukaOfficer':
            return state.talukaOfficers.find(user => user._id === id)
          case 'districtOfficer':
            return state.districtOfficers.find(user => user._id === id)
          default:
            return null
        }
      },

      // Get all users by role
      getUsersByRole: (role) => {
        const state = get()
        switch (role) {
          case 'superAdmin':
            return state.superAdmins
          case 'talukaOfficer':
            return state.talukaOfficers
          case 'districtOfficer':
            return state.districtOfficers
          default:
            return []
        }
      },


      // Add these methods to your existing adminStore

// Refresh all data based on current user's role
refreshAllData: async (token, BASE_URL, currentUserRole) => {
  set({ loading: true, error: null });
  try {
    const promises = [];

    // Based on current user role, determine what data to refresh
    switch (currentUserRole) {
      case 'superAdmin':
        promises.push(get().fetchAllDistrictOfficers(token, BASE_URL));
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        break;
      case 'districtOfficer':
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        // Add other relevant data for district officer
        break;
      case 'talukaOfficer':
        // Taluka officer might need different data
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        break;
      default:
        break;
    }

    await Promise.allSettled(promises);
    set({ 
      lastFetched: Date.now(),
      loading: false 
    });
    
    return true;
  } catch (error) {
    set({ 
      error: error.message, 
      loading: false 
    });
    throw error;
  }
},

// Quick refresh without loading states (for background refresh)
quickRefresh: async (token, BASE_URL, currentUserRole) => {
  try {
    const promises = [];

    switch (currentUserRole) {
      case 'superAdmin':
        promises.push(get().fetchAllDistrictOfficers(token, BASE_URL));
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        break;
      case 'districtOfficer':
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        break;
      case 'talukaOfficer':
        promises.push(get().fetchAllTalukaOfficers(token, BASE_URL));
        break;
      default:
        break;
    }

    await Promise.allSettled(promises);
    set({ lastFetched: Date.now() });
  } catch (error) {
    console.error('Background refresh failed:', error);
    // Silent fail for background operations
  }
},

      // Check if data needs refreshing
      shouldRefresh: () => {
        const { lastFetched } = get()
        return !lastFetched || (Date.now() - lastFetched) > 3 * 60 * 1000 // 3 minutes
      },

      // Clear specific role data or all data
      clearStore: (role = null) => {
        if (role) {
          switch (role) {
            case 'superAdmin':
              set({ superAdmins: [] })
              break
            case 'talukaOfficer':
              set({ talukaOfficers: [] })
              break
            case 'districtOfficer':
              set({ districtOfficers: [] })
              break
            default:
              break
          }
        } else {
          set({ 
            superAdmins: [], 
            talukaOfficers: [], 
            districtOfficers: [], 
            lastFetched: null,
            loading: false,
            error: null
          })
        }
        
        // Clear from localStorage as well
        localStorage.removeItem('admin-storage')
      }
    }),
    {
      name: 'admin-storage',
    }
  )
)