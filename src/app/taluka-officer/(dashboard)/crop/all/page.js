"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import CropCard from "@/components/ui/CropCard"
import { useCropStore } from "@/stores/cropStore"

export default function GetAllCropsPage() {
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  
  const {
    crops,
    farmersData,
    verifiersData,
    loading,
    error,
    fetchAllCrops,
    shouldRefresh
  } = useCropStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = localStorage.getItem("Authorization")?.split(" ")[1]
        if (!token) {
          toast.error("Session expired. Please login again.")
          router.push("/login")
          return
        }

        // Fetch data only if needed
        if (shouldRefresh() || crops.length === 0) {
          await fetchAllCrops(token, BASE_URL)
        }
      } catch (err) {
        console.error("Error initializing data:", err)
        if (err.response?.status === 401) {
          localStorage.removeItem("Authorization")
          toast.error("Session expired. Redirecting to login...")
          setTimeout(() => router.push("/login"), 2000)
        }
      }
    }

    initializeData()
  }, [BASE_URL, router, fetchAllCrops, shouldRefresh, crops.length])

  // Filter crops based on search and status
  const filteredCrops = crops.filter((crop) => {
    if (!crop) return false
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
                onClick={() => {
                  const token = localStorage.getItem("Authorization")?.split(" ")[1]
                  if (token) fetchAllCrops(token, BASE_URL)
                }}
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
  )
}
