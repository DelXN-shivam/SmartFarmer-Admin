"use client"

import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import CropCard from "@/components/ui/CropCard"

export default function VerifiedCropsPage() {
  const [loading, setLoading] = useState(true)
  const [crops, setCrops] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  // Memoized fetch function with proper error handling
  const getVerifiedCrops = useCallback(async () => {
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
        // Filter only verified crops
        const verifiedCrops = response.data.crops.filter(crop => 
          crop.applicationStatus === 'verified'
        )
        setCrops(verifiedCrops)
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
  }, [BASE_URL, router])

  useEffect(() => {
    getVerifiedCrops()
  }, [getVerifiedCrops])

  // Optimized filtering
  const filteredCrops = crops.filter((crop) => {
    if (!crop || typeof crop !== "object") return false
    const searchLower = searchTerm.toLowerCase()
    const name = crop.name || ""
    const address = crop.address || ""
    const previousCrop = crop.previousCrop || ""

    return (
      name.toLowerCase().includes(searchLower) ||
      address.toLowerCase().includes(searchLower) ||
      previousCrop.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-4 text-gray-600">Loading Verified Crops...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verified Crops</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={getVerifiedCrops}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
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
        <h1 className="text-3xl font-bold text-gray-900">Verified Crops</h1>
        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search verified crops..."
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
      <CropCard crops={filteredCrops} />
      <GoToTopButton />
    </div>
  );
}