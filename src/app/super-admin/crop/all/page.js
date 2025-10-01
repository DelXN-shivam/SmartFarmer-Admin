"use client";

import { useEffect, useState } from "react";
import { X, RefreshCw } from "lucide-react";
import GoToTopButton from "@/components/ui/GoToTopButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import CropCard from "@/components/ui/CropCard";
import { useCropStore } from "@/stores/cropStore";
import { useAuth } from "@/context/AuthContext";
import { useFarmerStore } from "@/stores/farmerStore";

export default function GetAllCropsPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user } = useAuth();

  const {
    crops,
    farmersData,
    verifiersData,
    loading,
    error,
    fetchAllCrops,
    shouldRefresh,
  } = useCropStore();

  const { farmersData: allFarmers } = useFarmerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [filteredCrops, setFilteredCrops] = useState([]);

  const initializeData = async (forceRefresh = false) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      // Always fetch if no crops or force refresh
      if (forceRefresh || shouldRefresh() || crops.length === 0) {
        console.log("🔄 Fetching ALL crops...");
        await fetchAllCrops(token, BASE_URL);
        if (!forceRefresh) {
          toast.success("Crops data loaded successfully!");
        } else {
          toast.success("Data refreshed successfully!");
        }
      } else {
        console.log("✅ Using cached crops data:", crops.length);
      }
    } catch (err) {
      console.error("Error initializing data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization");
        toast.error("Session expired. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        toast.error("Failed to load crops data");
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []); // Only run once on mount

  // Separate effect to monitor data changes
  useEffect(() => {
    console.log("📊 Crops data updated:", crops.length);
    console.log("📊 Farmers data:", Object.keys(farmersData || {}).length);
  }, [crops.length, farmersData]);

  // ✅ FILTER: All crops with district & taluka filter
  useEffect(() => {
    if (crops.length > 0) {
      const userTaluka = user?.taluka?.toLowerCase();
      const userDistrict = user?.district?.toLowerCase();

      const filtered = crops.filter((crop) => {
        if (!crop) return false;

        // Search filter
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          crop.name?.toLowerCase().includes(searchLower) ||
          crop.address?.toLowerCase().includes(searchLower) ||
          crop.previousCrop?.toLowerCase().includes(searchLower);

        // Status filter
        const matchesStatus =
          statusFilter === "all" || crop.applicationStatus === statusFilter;

        // Get farmer data for taluka/district
        const farmer = allFarmers[crop.farmerId] || farmersData[crop.farmerId];
        if (!farmer) return false;

        // Taluka & District filter
        const matchesDistrict = userDistrict
          ? farmer.district?.toLowerCase() === userDistrict
          : true;

        const matchesTaluka = userTaluka
          ? farmer.taluka?.toLowerCase() === userTaluka
          : true;

        return (
          matchesSearch && matchesStatus && matchesDistrict && matchesTaluka
        );
      });

      console.log(
        "✅ ALL CROPS - Total:",
        crops.length,
        "Filtered:",
        filtered.length
      );
      setFilteredCrops(filtered);
    } else {
      setFilteredCrops([]);
    }
  }, [
    crops,
    farmersData,
    allFarmers,
    user?.taluka,
    user?.district,
    searchTerm,
    statusFilter,
  ]);

  if (loading && crops.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        <p className="ml-4 text-gray-600">Loading Crops...</p>
      </div>
    );
  }

  if (error && crops.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Crops Directory
        </h1>
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
    );
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
            <RefreshCw
              className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
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
  );
}
