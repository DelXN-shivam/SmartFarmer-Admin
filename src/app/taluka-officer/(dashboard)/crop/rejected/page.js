"use client"

import { useEffect, useState } from "react"
import { X, RefreshCw } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { Input } from "@/components/ui/input"
import CropCard from "@/components/ui/CropCard"
import { useCropStore } from "@/stores/cropStore"
import { useAuth } from "@/context/AuthContext"
import { useFarmerStore } from "@/stores/farmerStore"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function RejectedCropsPage() {
  const { crops, farmersData, verifiersData, loading, fetchAllCrops, shouldRefresh } = useCropStore()
  const { farmersData: allFarmers } = useFarmerStore()
  const { user } = useAuth()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [filteredCrops, setFilteredCrops] = useState([])
  
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

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
        await fetchAllCrops(token, BASE_URL)
        toast.success("Data refreshed successfully!")
      }
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast.error("Failed to refresh data")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    initializeData()
  }, [])

  // ✅ FILTER: Only rejected crops with district & taluka filter
  useEffect(() => {
    if (crops.length > 0) {
      const userTaluka = user?.taluka?.toLowerCase();
      const userDistrict = user?.district?.toLowerCase();
      
      const filtered = crops.filter((crop) => {
        if (!crop) return false
        
        // Only rejected crops
        if (crop.applicationStatus !== 'rejected') return false
        
        // Search filter
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          crop.name?.toLowerCase().includes(searchLower) ||
          crop.address?.toLowerCase().includes(searchLower) ||
          crop.previousCrop?.toLowerCase().includes(searchLower)

        // Get farmer data for taluka/district
        const farmer = allFarmers[crop.farmerId] || farmersData[crop.farmerId];
        if (!farmer) return false;

        // Taluka & District filter
        const matchesDistrict = userDistrict ? 
          farmer.district?.toLowerCase() === userDistrict : true;
        
        const matchesTaluka = userTaluka ? 
          farmer.taluka?.toLowerCase() === userTaluka : true;

        return matchesSearch && matchesDistrict && matchesTaluka;
      })
      
      console.log("✅ REJECTED CROPS - Total:", crops.length, "Filtered:", filtered.length);
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops([]);
    }
  }, [crops, farmersData, allFarmers, user?.taluka, user?.district, searchTerm])

  if (loading && crops.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <p className="ml-4 text-gray-600">Loading Rejected Crops...</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.taluka ? `${user.taluka} Rejected Crops` : "Rejected Crops"} ({filteredCrops.length})
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search rejected crops..."
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
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
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

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

// import { useState } from "react"
// import { X, RefreshCw } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"
// import { useCropStore } from "@/stores/cropStore"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"

// export default function RejectedCropsPage() {
//   const { crops, farmersData, verifiersData, loading, fetchCropsByIds } = useCropStore()
//   const [searchTerm, setSearchTerm] = useState("")
//   const [refreshing, setRefreshing] = useState(false)
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

//   // Filter only rejected crops
//   const rejectedCrops = crops.filter(crop => 
//     crop.applicationStatus === 'rejected'
//   )

//   // Apply search filter
//   const filteredCrops = rejectedCrops.filter((crop) => {
//     if (!crop) return false
//     const searchLower = searchTerm.toLowerCase()
//     const name = crop.name || ""
//     const address = crop.address || ""
//     const previousCrop = crop.previousCrop || ""

//     return (
//       name.toLowerCase().includes(searchLower) ||
//       address.toLowerCase().includes(searchLower) ||
//       previousCrop.toLowerCase().includes(searchLower)
//     )
//   })

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true)
//       const token = localStorage.getItem("Authorization")?.split(" ")[1]
//       if (!token) {
//         toast.error("Session expired. Please login again.")
//         router.push("/login")
//         return
//       }
//       await fetchCropsByIds(BASE_URL)
//       toast.success("Data refreshed successfully!")
//     } catch (error) {
//       console.error("Error refreshing data:", error)
//       toast.error("Failed to refresh data")
//     } finally {
//       setRefreshing(false)
//     }
//   }

//   if (loading && crops.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
//         <p className="ml-4 text-gray-600">Loading Rejected Crops...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
//         <h1 className="text-3xl font-bold text-gray-900">Rejected Crops ({rejectedCrops.length})</h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search rejected crops..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
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

// import { useState } from "react"
// import { X } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"
// import { useCropStore } from "@/stores/cropStore"

// export default function RejectedCropsPage() {
//   const { crops, farmersData, verifiersData, loading } = useCropStore()
//   const [searchTerm, setSearchTerm] = useState("")

//   // Filter only rejected crops
//   const rejectedCrops = crops.filter(crop => 
//     crop.applicationStatus === 'rejected'
//   )

//   // Apply search filter
//   const filteredCrops = rejectedCrops.filter((crop) => {
//     if (!crop) return false
//     const searchLower = searchTerm.toLowerCase()
//     const name = crop.name || ""
//     const address = crop.address || ""
//     const previousCrop = crop.previousCrop || ""

//     return (
//       name.toLowerCase().includes(searchLower) ||
//       address.toLowerCase().includes(searchLower) ||
//       previousCrop.toLowerCase().includes(searchLower)
//     )
//   })

//   if (loading && crops.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
//         <p className="ml-4 text-gray-600">Loading Rejected Crops...</p>
//       </div>
//     )
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
//         <h1 className="text-3xl font-bold text-gray-900">Rejected Crops ({rejectedCrops.length})</h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search rejected crops..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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

// import axios from "axios"
// import { useEffect, useState, useCallback } from "react"
// import { X } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"

// export default function RejectedCropsPage() {
//   const [loading, setLoading] = useState(true)
//   const [crops, setCrops] = useState([])
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
  
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

//   // Memoized fetch function with proper error handling
//   const getRejectedCrops = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const token = localStorage.getItem("Authorization")?.split(" ")[1]
//       if (!token) {
//         toast.error("Session expired. Please login again.")
//         router.push("/login");
//         return
//       }
//       const response = await axios.get(`${BASE_URL}/api/crop/all`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       })
//       if (response.status === 200 && response.data?.crops) {
//         // Filter only rejected crops
//         const rejectedCrops = response.data.crops.filter(crop => 
//           crop.applicationStatus === 'rejected'
//         )
//         setCrops(rejectedCrops)
//       } else {
//         throw new Error("Invalid response structure")
//       }
//     } catch (err) {
//       console.error("Error fetching crops:", err)
//       const errorMessage = err.response?.data?.message || err.message || "Failed to fetch crops"
//       setError(errorMessage)
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization")
//         toast.error("Session expired. Redirecting to login...")
//         setTimeout(() => router.push("/login"), 2000)
//       }
//     } finally {
//       setLoading(false)
//     }
//   }, [BASE_URL, router])

//   useEffect(() => {
//     getRejectedCrops()
//   }, [getRejectedCrops])

//   // Optimized filtering
//   const filteredCrops = crops.filter((crop) => {
//     if (!crop || typeof crop !== "object") return false
//     const searchLower = searchTerm.toLowerCase()
//     const name = crop.name || ""
//     const address = crop.address || ""
//     const previousCrop = crop.previousCrop || ""

//     return (
//       name.toLowerCase().includes(searchLower) ||
//       address.toLowerCase().includes(searchLower) ||
//       previousCrop.toLowerCase().includes(searchLower)
//     )
//   })

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
//         <p className="ml-4 text-gray-600">Loading Rejected Crops...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Rejected Crops</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={getRejectedCrops}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
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
//         <h1 className="text-3xl font-bold text-gray-900">Rejected Crops</h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           {/* Search Input */}
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search rejected crops..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
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
//         </div>
//       </div>
//       <CropCard crops={filteredCrops} />
//       <GoToTopButton />
//     </div>
//   );
// }
