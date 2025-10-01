"use client";
import { useState, useEffect, useMemo } from "react";
import FarmerCard from "@/components/ui/FarmerCard";
import { X, RefreshCw } from "lucide-react";
import GoToTopButton from "@/components/ui/GoToTopButton";
import { toast } from "sonner";

import { useCropStore } from "@/stores/cropStore"; 
import { useUserDataStore } from "@/stores/userDataStore";
import { useFarmerStore } from "@/stores/farmerStore"; // ✅ ADD THIS
import { useAuth } from "@/context/AuthContext"; // ✅ ADD THIS

export default function FarmersPage() {
  const { farmersData, crops, shouldRefresh, loading, error } = useCropStore();

  // ✅ ADD: FarmerStore hooks
  const {
    farmersData: allFarmers,
    fetchAllFarmers,
    syncFarmersFromCrops,
    shouldRefresh: shouldRefreshFarmers,
  } = useFarmerStore();

  const { user } = useAuth(); // ✅ ADD: For filtering

  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useUserDataStore();

  // ✅ UPDATED: Fetch both crops AND farmers
  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true);
      try {
        // ✅ THEN fetch all farmers
        if (shouldRefreshFarmers()) {
          await fetchAllFarmers(token, BASE_URL);
        } else {
          // ✅ Sync farmers from crops if farmerStore empty
          syncFarmersFromCrops();
        }

        toast.success("Farmers data loaded successfully!");
      } catch (err) {
        console.error("Initialization error:", err);
        toast.error("Failed to fetch from API, using cached data.");
      } finally {
        setRefreshing(false);
      }
    };
    initializeData();
  }, [
    fetchAllFarmers,
    syncFarmersFromCrops,
    BASE_URL,
    token,
    shouldRefreshFarmers,
  ]);

  // ✅ UPDATED: Filter farmers based on user's taluka & district
  const filteredFarmers = useMemo(() => {
    const farmersArray = Object.values(allFarmers || {});
    if (!farmersArray.length) return [];

    const term = searchTerm.toLowerCase();
    const userTaluka = user?.taluka?.toLowerCase();
    const userDistrict = user?.district?.toLowerCase();

    return farmersArray.filter((farmer) => {
      // Search filter
      const matchesSearch = 
        farmer.name?.toLowerCase().includes(term) ||
        farmer.village?.toLowerCase().includes(term) ||
        farmer.district?.toLowerCase().includes(term);

      // ✅ Taluka & District filter (same as verifiers)
      const matchesDistrict = userDistrict ? 
        farmer.district?.toLowerCase() === userDistrict : true;
      
      const matchesTaluka = userTaluka ? 
        farmer.taluka?.toLowerCase() === userTaluka : true;

      return matchesSearch && matchesDistrict && matchesTaluka;
    });
  }, [allFarmers, searchTerm, user?.taluka, user?.district]);

  // ✅ UPDATED: Refresh both crops and farmers
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // ✅ Refresh farmers
      await fetchAllFarmers(token, BASE_URL);
      
      toast.success("Data refreshed successfully!");
    } catch (err) {
      console.error("Refresh error:", err);
      toast.error("Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

  // Debug: Check what's in storage
  useEffect(() => {
    console.log("🔍 Farmers in farmerStore:", Object.values(allFarmers || {}).length);
    console.log("🔍 User taluka/district:", user?.taluka, user?.district);
    
    // Check localStorage directly
    const stored = localStorage.getItem('farmer-storage');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log("💽 LocalStorage farmers count:", Object.values(parsed.state.farmersData || {}).length);
    }
  }, [allFarmers, user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading farmers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Farmers Directory
        </h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={handleRefresh}
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
          {user?.taluka ? `${user.taluka} Farmers Directory` : "Farmers Directory"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name, village or district..."
              className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Show counts for debugging */}
      {/* <div className="mb-4 text-sm text-gray-600">
        Total farmers in storage: {Object.values(allFarmers || {}).length} | 
        Filtered farmers: {filteredFarmers.length}
      </div> */}

      {/* Use filtered farmers from farmerStore */}
      <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

      <GoToTopButton />
    </div>
  );
}

