"use client"

import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import CropCard from "@/components/ui/CropCard"

export default function GetAllCropsPage() {
  const [loading, setLoading] = useState(true)
  const [crops, setCrops] = useState([])
  const [farmersData, setFarmersData] = useState({})
  const [verifiersData, setVerifiersData] = useState({})
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  // Function to fetch farmers data in background
  const fetchFarmersData = useCallback(async (farmerIds) => {
    if (!farmerIds || farmerIds.length === 0) return;
    
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) return;
      
      const response = await axios.post(`${BASE_URL}/api/farmer/by-ids`, 
        { ids: farmerIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 200 && response.data?.data) {
        const farmersMap = {};
        response.data.data.forEach(farmer => {
          farmersMap[farmer._id] = farmer;
        });
        setFarmersData(prev => ({ ...prev, ...farmersMap }));
      }
    } catch (err) {
      console.error("Error fetching farmers data:", err);
      // Silently fail for background requests
    }
  }, [BASE_URL]);

  // Function to fetch verifiers data in background
  const fetchVerifiersData = useCallback(async (verifierIds) => {
    if (!verifierIds || verifierIds.length === 0) return;
    
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) return;
      
      const response = await axios.post(`${BASE_URL}/api/verifier/by-ids`, 
        { ids: verifierIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (response.status === 200 && response.data?.data) {
        const verifiersMap = {};
        response.data.data.forEach(verifier => {
          verifiersMap[verifier._id] = verifier;
        });
        setVerifiersData(prev => ({ ...prev, ...verifiersMap }));
      }
    } catch (err) {
      console.error("Error fetching verifiers data:", err);
      // Silently fail for background requests
    }
  }, [BASE_URL]);

  // Memoized fetch function with proper error handling
  const getAllCrops = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Session expired. Please login again.")
        router.push("/login");
        return
      }
      const response = await axios.get(`${BASE_URL}/api/crop/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      if (response.status === 200 && response.data?.crops) {
        setCrops(response.data.crops)
        
        // Extract unique farmerIds and verifierIds for background API calls
        const farmerIds = [...new Set(response.data.crops
          .map(crop => crop.farmerId)
          .filter(id => id && !farmersData[id]))];
        
        const verifierIds = [...new Set(response.data.crops
          .map(crop => crop.verifierId)
          .filter(id => id && !verifiersData[id]))];
        
        // Make background API calls
        if (farmerIds.length > 0) {
          fetchFarmersData(farmerIds);
        }
        
        if (verifierIds.length > 0) {
          fetchVerifiersData(verifierIds);
        }
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (err) {
      console.error("Error fetching crops:", err)
      const errorMessage = err.response?.data?.message || err.message || "Failed to fetch crops"
      setError(errorMessage)
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization")
        toast.error("Session expired. Redirecting to login...")
        setTimeout(() => router.push("/login"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }, [BASE_URL, router, farmersData, verifiersData, fetchFarmersData, fetchVerifiersData])

  useEffect(() => {
    getAllCrops()
  }, [getAllCrops])

  // Optimized filtering
  const filteredCrops = crops.filter((crop) => {
    if (!crop || typeof crop !== "object") return false
    const searchLower = searchTerm.toLowerCase()
    const name = crop.name || ""
    const address = crop.address || ""
    const previousCrop = crop.previousCrop || ""

    return (
      (name.toLowerCase().includes(searchLower) ||
        address.toLowerCase().includes(searchLower) ||
        previousCrop.toLowerCase().includes(searchLower)) &&
      (statusFilter === "all" || crop.applicationStatus === statusFilter)
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-4 text-gray-600">Loading Crops...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={getAllCrops}
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
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
        <h1 className="text-3xl font-bold text-gray-900">Crops Directory</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search crops..."
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
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
        </div>
      </div>
      <CropCard 
        crops={filteredCrops} 
        farmersData={farmersData}
        verifiersData={verifiersData}
      />
      <GoToTopButton />
    </div>
  );
}





// "use client"

// import axios from "axios"
// import { useEffect, useState, useCallback } from "react"
// import { X } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import { Input } from "@/components/ui/input"
// import CropCard from "@/components/ui/CropCard"

// export default function GetAllCropsPage() {
//   const [loading, setLoading] = useState(true)
//   const [crops, setCrops] = useState([])
//   const [error, setError] = useState(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
  
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

//   // Memoized fetch function with proper error handling
//   const getAllCrops = useCallback(async () => {
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
//         setCrops(response.data.crops)
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
//     getAllCrops()
//   }, [getAllCrops])

//   // Optimized filtering
//   const filteredCrops = crops.filter((crop) => {
//     if (!crop || typeof crop !== "object") return false
//     const searchLower = searchTerm.toLowerCase()
//     const name = crop.name || ""
//     const address = crop.address || ""
//     const previousCrop = crop.previousCrop || ""

//     return (
//       (name.toLowerCase().includes(searchLower) ||
//         address.toLowerCase().includes(searchLower) ||
//         previousCrop.toLowerCase().includes(searchLower)) &&
//       (statusFilter === "all" || crop.applicationStatus === statusFilter)
//     )
//   })

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
//         <p className="ml-4 text-gray-600">Loading Crops...</p>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Crops Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={getAllCrops}
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
//         <h1 className="text-3xl font-bold text-gray-900">Crops Directory</h1>
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           {/* Search Input */}
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
//         </div>
//       </div>
//       <CropCard crops={filteredCrops} />
//       <GoToTopButton />
//     </div>
//   );
// }
