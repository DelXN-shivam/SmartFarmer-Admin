"use client"

import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import { X } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import VerifierCard from "@/components/ui/VerifierCard"

export default function VerifiersPage() {
  const [loading, setLoading] = useState(true)
  const [verifiers, setVerifiers] = useState([])
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

  // Memoized fetch function with proper error handling
  const getAllVerifiers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Session expired. Please login again.")
        router.push("/admin/login")
        return
      }

      const response = await axios.get(`${BASE_URL}/api/verifier`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.status === 200 && response.data?.data) {
        setVerifiers(response.data.data)
      } else {
        throw new Error("Invalid response structure")
      }
    } catch (err) {
      console.error("Error fetching verifiers:", err)
      const errorMessage = err.response?.data?.message ||
        err.message ||
        "Failed to fetch verifiers"
      setError(errorMessage)

      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization")
        toast.error("Session expired. Redirecting to login...")
        setTimeout(() => router.push("/admin/login"), 2000)
      }
    } finally {
      setLoading(false)
    }
  }, [BASE_URL, router])

  useEffect(() => {
    getAllVerifiers()
  }, [getAllVerifiers])

  const handleVerifyVerifier = async (verifierToVerify) => {
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Authentication required")
        return router.push("/admin/login")
      }

      const response = await axios.put(
        `${BASE_URL}/api/verifier/${verifierToVerify._id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        setVerifiers(prev =>
          prev.map(v =>
            v._id === verifierToVerify._id ? { ...v, isVerified: true } : v
          )
        )
        toast.success(`Verified ${verifierToVerify.name} successfully!`)
      }
    } catch (err) {
      console.error("Verification failed:", err)
      toast.error(`Failed to verify ${verifierToVerify.name}: ${err.response?.data?.message || "Server error"}`)
    }
  }

  const handleEditVerifier = async (updatedVerifier) => {
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1]
      if (!token) {
        toast.error("Authentication required")
        return router.push("/admin/login")
      }

      const response = await axios.patch(
        `${BASE_URL}/api/verifier/update/${updatedVerifier._id}`,
        updatedVerifier,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      if (response.status === 200) {
        setVerifiers(prev =>
          prev.map(v =>
            v._id === updatedVerifier._id ? response.data.data : v
          )
        )
        toast.success("Verifier updated successfully!")
        setTimeout(() => {
          getAllVerifiers();
        } , 1500)
      }
    } catch (err) {
      console.error("Update failed:", err)
      toast.error(`Update failed: ${err.response?.data?.message || "Server error"}`)
    }
  }

  // Optimized filtering
  const filteredVerifiers = verifiers.filter(verifier => {
    if (!verifier || typeof verifier !== "object") return false

    const searchLower = searchTerm.toLowerCase()
    const name = verifier.name || ""
    const village = verifier.village || ""
    const district = verifier.district || ""

    return (
      (name.toLowerCase().includes(searchLower) ||
        village.toLowerCase().includes(searchLower) ||
        district.toLowerCase().includes(searchLower)) &&
      (statusFilter === "all" || verifier.applicationStatus === statusFilter)
    )
  })


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading Verifiers...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifier Directory</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={getAllVerifiers}
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
        <h1 className="text-3xl font-bold text-gray-900">Verifier Directory</h1>

        <div className="flex flex-col sm:flex-row  w-full md:w-auto">
          {/* Status Filter */}
          {/* <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select> */}

          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search verifiers..."
              className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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

      <VerifierCard
        verifiers={filteredVerifiers}
        onVerify={handleVerifyVerifier}
        onEdit={handleEditVerifier}
      />

      <GoToTopButton />
    </div>
  )
}