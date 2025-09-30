"use client"

import { useEffect, useState } from "react"
import { X, RefreshCw } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import CropCard from "@/components/ui/CropCard"
import { useCropStore } from "@/stores/cropStore"
import { useAuth } from "@/context/AuthContext"
import { useFarmerStore } from "@/stores/farmerStore"

export default function GetAllCropsPage() {
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  const { user } = useAuth()
  
  const {
    crops,
    farmersData,
    verifiersData,
    loading,
    error,
    fetchAllCrops,
    fetchCropsByIds,
    shouldRefresh
  } = useCropStore()

  const { farmersData: allFarmers } = useFarmerStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [refreshing, setRefreshing] = useState(false)
  const [filteredCrops, setFilteredCrops] = useState([])

  const initializeData = async (forceRefresh = false) => {
    try {
      setRefreshing(true)
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Session expired. Please login again.")
        router.push("/login")
        return
      }

      if (forceRefresh || shouldRefresh() || crops.length === 0) {
        console.log("🔄 Fetching ALL crops...")
        await fetchAllCrops(token, BASE_URL)
        toast.success("Data refreshed successfully!")
      }
    } catch (err) {
      console.error("Error initializing data:", err)
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization")
        toast.error("Session expired. Redirecting to login...")
        setTimeout(() => router.push("/login"), 2000)
      }
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    initializeData()
  }, [BASE_URL, router, fetchAllCrops, shouldRefresh, crops.length])

  // ✅ FILTER: All crops with district & taluka filter
  useEffect(() => {
    if (crops.length > 0) {
      const userTaluka = user?.taluka?.toLowerCase();
      const userDistrict = user?.district?.toLowerCase();
      
      const filtered = crops.filter((crop) => {
        if (!crop) return false
        
        // Search filter
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          crop.name?.toLowerCase().includes(searchLower) ||
          crop.address?.toLowerCase().includes(searchLower) ||
          crop.previousCrop?.toLowerCase().includes(searchLower)
        
        // Status filter
        const matchesStatus = statusFilter === "all" || 
          crop.applicationStatus === statusFilter

        // Get farmer data for taluka/district
        const farmer = allFarmers[crop.farmerId] || farmersData[crop.farmerId];
        if (!farmer) return false;

        // Taluka & District filter
        const matchesDistrict = userDistrict ? 
          farmer.district?.toLowerCase() === userDistrict : true;
        
        const matchesTaluka = userTaluka ? 
          farmer.taluka?.toLowerCase() === userTaluka : true;

        return matchesSearch && matchesStatus && matchesDistrict && matchesTaluka;
      })
      
      console.log("✅ ALL CROPS - Total:", crops.length, "Filtered:", filtered.length);
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops([]);
    }
  }, [crops, farmersData, allFarmers, user?.taluka, user?.district, searchTerm, statusFilter]);

  if (loading && crops.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-4 text-gray-600">Loading Crops...</p>
      </div>
    )
  }

  if (error && crops.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => initializeData(true)}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-700 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.taluka ? `${user.taluka} Crops Directory` : "Crops Directory"}
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search crops..."
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => initializeData(true)}
            disabled={refreshing}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* <div className="mb-4 text-sm text-gray-600">
        Total crops in storage: {crops.length} | Filtered crops: {filteredCrops.length}
      </div> */}

      <CropCard 
        crops={filteredCrops} 
        farmersData={{ ...farmersData, ...allFarmers }}
        verifiersData={verifiersData}
      />
      <GoToTopButton />
    </div>
  )
}







// "use client"

// import { useEffect, useState } from "react"
// import { X, RefreshCw } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"
// import { useCropStore } from "@/stores/cropStore"
// import { useAuth } from "@/context/AuthContext"
// import { useFarmerStore } from "@/stores/farmerStore" // ✅ ADD

// export default function GetAllCropsPage() {
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
//   const { user } = useAuth()
  
//   const {
//     crops,
//     farmersData,
//     verifiersData,
//     loading,
//     error,
//     fetchAllCrops, // ✅ USE THIS
//     fetchCropsByIds,
//     shouldRefresh
//   } = useCropStore()

//   // ✅ ADD: FarmerStore for better farmer data
//   const { farmersData: allFarmers } = useFarmerStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [refreshing, setRefreshing] = useState(false)
//   const [filteredCrops, setFilteredCrops] = useState([])

//   // ✅ UPDATED: Function to initialize data
//   const initializeData = async (forceRefresh = false) => {
//     try {
//       setRefreshing(true)
//       const token = localStorage.getItem("Authorization")?.split(" ")[1]
//       if (!token) {
//         toast.error("Session expired. Please login again.")
//         router.push("/login")
//         return
//       }

//       // ✅ FIX: Use fetchAllCrops for ALL crops
//       if (forceRefresh || shouldRefresh() || crops.length === 0) {
//         console.log("🔄 Fetching ALL crops...")
//         await fetchAllCrops(token, BASE_URL)
//         toast.success("Data refreshed successfully!")
//       }
//     } catch (err) {
//       console.error("Error initializing data:", err)
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization")
//         toast.error("Session expired. Redirecting to login...")
//         setTimeout(() => router.push("/login"), 2000)
//       }
//     } finally {
//       setRefreshing(false)
//     }
//   }

//   useEffect(() => {
//     initializeData()
//   }, [BASE_URL, router, fetchAllCrops, shouldRefresh, crops.length])

//   // ✅ UPDATED: Filter crops based on taluka, search, and status
// useEffect(() => {
//   if (crops.length > 0) {
//     const userTaluka = user?.taluka?.toLowerCase();
//     const userDistrict = user?.district?.toLowerCase();
    
//     const filtered = crops.filter((crop) => {
//       if (!crop) return false
      
//       // Search filter
//       const searchLower = searchTerm.toLowerCase()
//       const matchesSearch = 
//         crop.name?.toLowerCase().includes(searchLower) ||
//         crop.address?.toLowerCase().includes(searchLower) ||
//         crop.previousCrop?.toLowerCase().includes(searchLower)
      
//       // Status filter
//       const matchesStatus = statusFilter === "all" || 
//         crop.applicationStatus === statusFilter

//       // Get farmer data
//       const farmer = allFarmers[crop.farmerId] || farmersData[crop.farmerId];
//       if (!farmer) return false; // Skip if no farmer data

//       // Taluka & District filter
//       const matchesDistrict = userDistrict ? 
//         farmer.district?.toLowerCase() === userDistrict : true;
      
//       const matchesTaluka = userTaluka ? 
//         farmer.taluka?.toLowerCase() === userTaluka : true;

//       return matchesSearch && matchesStatus && matchesDistrict && matchesTaluka;
//     })
    
//     console.log("✅ FILTERING - Total:", crops.length, "Filtered:", filtered.length);
//     setFilteredCrops(filtered);
//   } else {
//     setFilteredCrops([]);
//   }
// }, [crops, farmersData, allFarmers, user?.taluka, user?.district, searchTerm, statusFilter]);

//   // Debug: Check storage
//   useEffect(() => {
//     console.log("🔍 Crops in store:", crops.length)
//     console.log("🔍 User taluka/district:", user?.taluka, user?.district)
    
//     // Check localStorage directly
//     const stored = localStorage.getItem('crop-storage')
//     if (stored) {
//       const parsed = JSON.parse(stored)
//       console.log("💽 LocalStorage crops count:", parsed.state.crops?.length)
//     }
//   }, [crops, user])

//   if (loading && crops.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         <p className="ml-4 text-gray-600">Loading Crops...</p>
//       </div>
//     )
//   }

//   if (error && crops.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={() => initializeData(true)}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-700 underline"
//               >
//                 Try again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
//         <h1 className="text-3xl font-bold text-gray-900">
//           {user?.taluka ? `${user.taluka} Crops Directory` : "Crops Directory"}
//         </h1>
        
//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-grow">
//             <Input
//               type="text"
//               placeholder="Search crops..."
//               className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                 aria-label="Clear search"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             )}
//           </div>
          
//           <button
//             onClick={() => initializeData(true)}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Show counts for debugging */}
//       <div className="mb-4 text-sm text-gray-600">
//         Total crops in storage: {crops.length} | 
//         Filtered crops: {filteredCrops.length}
//       </div>

//       <CropCard 
//         crops={filteredCrops} 
//         farmersData={{ ...farmersData, ...allFarmers }} // ✅ Combine both farmer sources
//         verifiersData={verifiersData}
//       />
//       <GoToTopButton />
//     </div>
//   )
// }































// "use client"

// import { useEffect, useState } from "react"
// import { X, RefreshCw } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"
// import { useCropStore } from "@/stores/cropStore"
// import { useAuth } from "@/context/AuthContext"

// export default function GetAllCropsPage() {
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
//   const { user } = useAuth()
  
//   const {
//     crops,
//     farmersData,
//     verifiersData,
//     loading,
//     error,
//     fetchAllCrops,
//     fetchCropsByIds,
//     shouldRefresh
//   } = useCropStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [refreshing, setRefreshing] = useState(false)
//   const [filteredCrops, setFilteredCrops] = useState([])

//   // Function to initialize data
//   const initializeData = async (forceRefresh = false) => {
//     try {
//       setRefreshing(true)
//       const token = localStorage.getItem("Authorization")?.split(" ")[1]
//       if (!token) {
//         toast.error("Session expired. Please login again.")
//         router.push("/login")
//         return
//       }

//       // Fetch data only if needed
//       if (forceRefresh || shouldRefresh() || crops.length === 0) {
//         // await fetchAllCrops(token, BASE_URL)
//         await fetchCropsByIds(BASE_URL)
//         toast.success("Data refreshed successfully!")
//       }
//     } catch (err) {
//       console.error("Error initializing data:", err)
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization")
//         toast.error("Session expired. Redirecting to login...")
//         setTimeout(() => router.push("/login"), 2000)
//       }
//     } finally {
//       setRefreshing(false)
//     }
//   }

//   useEffect(() => {
//     initializeData()
//   }, [BASE_URL, router, fetchCropsByIds, shouldRefresh, crops.length])

//   // Filter crops based on taluka, search, and status
//   useEffect(() => {
//     setFilteredCrops(crops)
//     // if (user?.taluka && crops.length > 0) {
//     //   const filtered = crops.filter((crop) => {
//     //     if (!crop) return false
        
//     //     // Get farmer data to check taluka
//     //     const farmer = farmersData[crop.farmerId];
//     //     const matchesTaluka = farmer && farmer.taluka === user.taluka;
        
//     //     const searchLower = searchTerm.toLowerCase()
//     //     const name = crop.name || ""
//     //     const address = crop.address || ""
//     //     const previousCrop = crop.previousCrop || ""

//     //     const matchesSearch = name.toLowerCase().includes(searchLower) ||
//     //       address.toLowerCase().includes(searchLower) ||
//     //       previousCrop.toLowerCase().includes(searchLower)
        
//     //     const matchesStatus = statusFilter === "all" || 
//     //       crop.applicationStatus === statusFilter

//     //     return matchesTaluka && matchesSearch && matchesStatus
//     //   })
//     //   setFilteredCrops(filtered)
//     // } else {
//     //   // If no taluka filter or no user taluka, use regular filtering
//     //   const filtered = crops.filter((crop) => {
//     //     if (!crop) return false
//     //     const searchLower = searchTerm.toLowerCase()
//     //     const name = crop.name || ""
//     //     const address = crop.address || ""
//     //     const previousCrop = crop.previousCrop || ""

//     //     const matchesSearch = name.toLowerCase().includes(searchLower) ||
//     //       address.toLowerCase().includes(searchLower) ||
//     //       previousCrop.toLowerCase().includes(searchLower)
        
//     //     const matchesStatus = statusFilter === "all" || 
//     //       crop.applicationStatus === statusFilter

//     //     return matchesSearch && matchesStatus
//     //   })
//     //   setFilteredCrops(filtered)
//     // }
//   }, [crops, farmersData, user?.taluka, searchTerm, statusFilter])

//   if (loading && crops.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         <p className="ml-4 text-gray-600">Loading Crops...</p>
//       </div>
//     )
//   }

//   if (error && crops.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={() => initializeData(true)}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-700 underline"
//               >
//                 Try again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
//         <h1 className="text-3xl font-bold text-gray-900">
//           {user?.taluka ? `${user.taluka} Crops Directory` : "Crops Directory"}
//         </h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search crops..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                 aria-label="Clear search"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             )}
//           </div>
//           <button
//             onClick={() => initializeData(true)}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>
//       <CropCard 
//         crops={filteredCrops} 
//         farmersData={farmersData}
//         verifiersData={verifiersData}
//       />
//       <GoToTopButton />
//     </div>
//   )
// }

















// "use client"

// import { useEffect, useState } from "react"
// import { X, RefreshCw } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"
// import { useCropStore } from "@/stores/cropStore"
// import { useAuth } from "@/context/AuthContext"

// export default function GetAllCropsPage() {
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
//   const { user } = useAuth()
  
//   const {
//     crops,
//     farmersData,
//     verifiersData,
//     loading,
//     error,
//     fetchAllCrops,
//     shouldRefresh
//   } = useCropStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [refreshing, setRefreshing] = useState(false)
//   const [filteredCrops, setFilteredCrops] = useState([])

//   // Function to initialize data
//   const initializeData = async (forceRefresh = false) => {
//     try {
//       setRefreshing(true)
//       const token = localStorage.getItem("Authorization")?.split(" ")[1]
//       if (!token) {
//         toast.error("Session expired. Please login again.")
//         router.push("/login")
//         return
//       }

//       // Fetch data only if needed
//       if (forceRefresh || shouldRefresh() || crops.length === 0) {
//         await fetchAllCrops(token, BASE_URL)
//         toast.success("Data refreshed successfully!")
//       }
//     } catch (err) {
//       console.error("Error initializing data:", err)
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization")
//         toast.error("Session expired. Redirecting to login...")
//         setTimeout(() => router.push("/login"), 2000)
//       }
//     } finally {
//       setRefreshing(false)
//     }
//   }

//   useEffect(() => {
//     initializeData()
//   }, [BASE_URL, router, fetchAllCrops, shouldRefresh, crops.length])

//   // Filter crops based on taluka, search, and status
//   useEffect(() => {
//     if (user?.taluka && crops.length > 0) {
//       const filtered = crops.filter((crop) => {
//         if (!crop) return false
        
//         // Get farmer data to check taluka
//         const farmer = farmersData[crop.farmerId];
//         const matchesTaluka = farmer && farmer.taluka === user.taluka;
        
//         const searchLower = searchTerm.toLowerCase()
//         const name = crop.name || ""
//         const address = crop.address || ""
//         const previousCrop = crop.previousCrop || ""

//         const matchesSearch = name.toLowerCase().includes(searchLower) ||
//           address.toLowerCase().includes(searchLower) ||
//           previousCrop.toLowerCase().includes(searchLower)
        
//         const matchesStatus = statusFilter === "all" || 
//           crop.applicationStatus === statusFilter

//         return matchesTaluka && matchesSearch && matchesStatus
//       })
//       setFilteredCrops(filtered)
//     } else {
//       // If no taluka filter or no user taluka, use regular filtering
//       const filtered = crops.filter((crop) => {
//         if (!crop) return false
//         const searchLower = searchTerm.toLowerCase()
//         const name = crop.name || ""
//         const address = crop.address || ""
//         const previousCrop = crop.previousCrop || ""

//         const matchesSearch = name.toLowerCase().includes(searchLower) ||
//           address.toLowerCase().includes(searchLower) ||
//           previousCrop.toLowerCase().includes(searchLower)
        
//         const matchesStatus = statusFilter === "all" || 
//           crop.applicationStatus === statusFilter

//         return matchesSearch && matchesStatus
//       })
//       setFilteredCrops(filtered)
//     }
//   }, [crops, farmersData, user?.taluka, searchTerm, statusFilter])

//   if (loading && crops.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         <p className="ml-4 text-gray-600">Loading Crops...</p>
//       </div>
//     )
//   }

//   if (error && crops.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={() => initializeData(true)}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-700 underline"
//               >
//                 Try again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
//         <h1 className="text-3xl font-bold text-gray-900">
//           {user?.taluka ? `${user.taluka} Crops Directory` : "Crops Directory"}
//         </h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search crops..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                 aria-label="Clear search"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             )}
//           </div>
//           <button
//             onClick={() => initializeData(true)}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>
//       <CropCard 
//         crops={filteredCrops} 
//         farmersData={farmersData}
//         verifiersData={verifiersData}
//       />
//       <GoToTopButton />
//     </div>
//   )
// }