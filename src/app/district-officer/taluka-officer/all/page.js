"use client"

import axios from "axios"
import { useEffect, useState, useCallback } from "react"
import { X, RefreshCw } from "lucide-react"
import GoToTopButton from "@/components/ui/GoToTopButton"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import VerifierCard from "@/components/ui/VerifierCard"
import { Input } from "@/components/ui/input"

export default function AllTalukaOfficers() {
  const [loading, setLoading] = useState(true)
  const [talukaOfficers, setTalukaOfficers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  // Memoized fetch function with proper error handling
  const getAllTalukaOfficers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }
      const response = await axios.get(`${BASE_URL}/api/taluka-officer`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.status === 200 && response.data?.data) {
        setTalukaOfficers(response.data.data);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (err) {
      console.error("Error fetching taluka officers:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to fetch taluka officers";
      setError(errorMessage);
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization");
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [BASE_URL, router]);

  // Refresh function exactly like other pages
  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      await getAllTalukaOfficers();
      toast.success("Taluka officers data refreshed successfully!");
    } catch (err) {
      console.error("Error refreshing taluka officers:", err);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    getAllTalukaOfficers();
  }, [getAllTalukaOfficers]);

  const handleVerifyVerifier = async (verifierToVerify) => {
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Authentication required");
        return router.push("/login");
      }
      const response = await axios.put(
        `${BASE_URL}/api/verifier/${verifierToVerify._id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setTalukaOfficers((prev) =>
          prev.map((v) =>
            v._id === verifierToVerify._id ? { ...v, isVerified: true } : v
          )
        );
        toast.success(`Verified ${verifierToVerify.name} successfully!`);
      }
    } catch (err) {
      console.error("Verification failed:", err);
      toast.error(
        `Failed to verify ${verifierToVerify.name}: ${
          err.response?.data?.message || "Server error"
        }`
      );
    }
  };

  const handleEditVerifier = async (updatedVerifier) => {
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Authentication required");
        return router.push("/login");
      }
      const response = await axios.patch(
        `${BASE_URL}/api/verifier/update/${updatedVerifier._id}`,
        updatedVerifier,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.status === 200) {
        setTalukaOfficers((prev) =>
          prev.map((v) =>
            v._id === updatedVerifier._id ? response.data.data : v
          )
        );
        toast.success("Verifier updated successfully!");
        setTimeout(() => {
          getAllTalukaOfficers();
        }, 1500);
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(
        `Update failed: ${err.response?.data?.message || "Server error"}`
      );
    }
  };

  // Optimized filtering
  const filteredTalukaOfficers = talukaOfficers.filter((verifier) => {
    if (!verifier || typeof verifier !== "object") return false;
    const searchLower = searchTerm.toLowerCase();
    const name = verifier.name || "";
    const village = verifier.village || "";
    const district = verifier.district || "";
    const taluka = verifier.taluka || "";

    return (
      (name.toLowerCase().includes(searchLower) ||
        village.toLowerCase().includes(searchLower) ||
        district.toLowerCase().includes(searchLower) ||
        taluka.toLowerCase().includes(searchLower)) &&
      (statusFilter === "all" || verifier.applicationStatus === statusFilter)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading Taluka Officers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Taluka Officer Directory
        </h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={getAllTalukaOfficers}
                className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
        <h1 className="text-3xl font-bold text-gray-900">
          Taluka Officer Directory
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search taluka officers..."
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          
          {/* Refresh Button - Same as other pages */}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      <VerifierCard
        verifiers={filteredTalukaOfficers}
        category={"Taluka Officer"}
        onVerify={handleVerifyVerifier}
        onEdit={handleEditVerifier}
        isTalukasAllocated={false}
      />
      <GoToTopButton />
    </div>
  );
}

