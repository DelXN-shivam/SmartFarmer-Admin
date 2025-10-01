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

export default function PendingCropsPage() {
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

  // ✅ FILTER: Only pending crops with district & taluka filter
  useEffect(() => {
    if (crops.length > 0) {
      const userTaluka = user?.taluka?.toLowerCase();
      const userDistrict = user?.district?.toLowerCase();
      
      const filtered = crops.filter((crop) => {
        if (!crop) return false
        
        // Only pending crops
        if (crop.applicationStatus !== 'pending') return false
        
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
      
      console.log("✅ PENDING CROPS - Total:", crops.length, "Filtered:", filtered.length);
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops([]);
    }
  }, [crops, farmersData, allFarmers, user?.taluka, user?.district, searchTerm])

  if (loading && crops.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        <p className="ml-4 text-gray-600">Loading Pending Crops...</p>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
        <h1 className="text-3xl font-bold text-gray-900">
          {user?.taluka ? `${user.taluka} Pending Crops` : "Pending Crops"} ({filteredCrops.length})
        </h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search pending crops..."
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
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
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
