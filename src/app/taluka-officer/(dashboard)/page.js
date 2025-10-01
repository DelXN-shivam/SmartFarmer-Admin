
"use client";
import React, { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, MapPin, LogOut, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useCropStore } from "@/stores/cropStore";
import { useVerifierStore } from "@/stores/verifierStore";

export default function Dashboard() {
  const [farmerCount, setFarmerCount] = useState(0);
  const [verifierCount, setVerifierCount] = useState(0);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [verifierLoading, setVerifierLoading] = useState(false);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dataInitialized, setDataInitialized] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token, role, email, user, setUserData } = useUserDataStore();
  const { logout } = useAuth();
  const router = useRouter();

  // Stores
  const {
    farmersData,
    crops,
    fetchAllCrops,
    shouldRefresh: shouldRefreshCrops,
  } = useCropStore();
  const {
    verifiers,
    fetchAllVerifiers,
    shouldRefresh: shouldRefreshVerifiers,
  } = useVerifierStore();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      setUserData(null);
    }
  };

  // Farmers count from cropStore
  const getFarmerCount = () => {
    setFarmerLoading(true);
    try {
      const userTaluka = user?.taluka?.toLowerCase();
      const userDistrict = user?.district?.toLowerCase();

      const farmersArray = Object.values(farmersData || {});
      const filteredCount = farmersArray.filter((farmer) => {
        if (!farmer || typeof farmer !== "object") return false;

        const matchesDistrict = userDistrict
          ? farmer.district?.toLowerCase() === userDistrict
          : true;

        const matchesTaluka = userTaluka
          ? farmer.taluka?.toLowerCase() === userTaluka
          : true;

        return matchesDistrict && matchesTaluka;
      }).length;

      setFarmerCount(filteredCount);
    } catch (error) {
      console.error("Error calculating farmer count:", error);
      setFarmerCount(0);
    } finally {
      setFarmerLoading(false);
    }
  };

  // Dashboard page.js - getVerifierCount function UPDATE
  const getVerifierCount = async () => {
    setVerifierLoading(true);

    try {
      // ✅ FIX: Use verifierStore se filtered count lo
      const { verifiers } = useVerifierStore.getState();

      if (verifiers && verifiers.length > 0) {
        // ✅ Same filter logic use karo jo all verifiers page mein hai
        const filteredCount = verifiers.filter((verifier) => {
          if (!verifier || typeof verifier !== "object") return false;

          // ✅ Same filtering as all verifiers page
          const matchesDistrict = user?.district
            ? verifier.district?.toLowerCase() === user.district.toLowerCase()
            : true;

          const matchesTaluka = user?.taluka
            ? verifier.taluka?.toLowerCase() === user.taluka.toLowerCase()
            : true;

          return matchesDistrict && matchesTaluka;
        }).length;

        setVerifierCount(filteredCount);
        console.log("📊 Dashboard - Filtered verifier count:", filteredCount);
      } else {
        // Agar store empty hai toh user.verifierId use karo
        const ids = user?.verifierId || [];
        setVerifierCount(Array.isArray(ids) ? ids.length : 0);
      }
    } catch (error) {
      console.error("Error calculating verifier count:", error);
      // Fallback to original logic
      const ids = user?.verifierId || [];
      setVerifierCount(Array.isArray(ids) ? ids.length : 0);
    } finally {
      setVerifierLoading(false);
    }
  };

  const getRecentCrops = async () => {
    try {
      setRecentLoading(true);

      if (crops && crops.length > 0) {
        const userTaluka = user?.taluka?.toLowerCase();
        const userDistrict = user?.district?.toLowerCase();

        const filtered = crops.filter((crop) => {
          if (!crop) return false;

          const farmer = farmersData[crop.farmerId];
          if (!farmer) return false;

          const matchesDistrict = userDistrict
            ? farmer.district?.toLowerCase() === userDistrict
            : true;

          const matchesTaluka = userTaluka
            ? farmer.taluka?.toLowerCase() === userTaluka
            : true;

          return matchesDistrict && matchesTaluka;
        });

        filtered.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRecentCrops(filtered.slice(0, 5));
      } else {
        setRecentCrops([]);
      }
    } catch (error) {
      console.error("Error getting recent crops:", error);
      setRecentCrops([]);
    } finally {
      setRecentLoading(false);
    }
  };

  // Background refresh
  const fetchBackgroundData = async () => {
    if (!token || dataInitialized) return;

    try {
      console.log("🔄 Dashboard: Starting data initialization...");
      
      // Fetch all crops if needed
      if (shouldRefreshCrops() || crops.length === 0) {
        console.log("🔄 Dashboard: Fetching crops...");
        await fetchAllCrops(token, BASE_URL);
      }

      // Fetch all verifiers if needed
      if (shouldRefreshVerifiers() || verifiers.length === 0) {
        console.log("🔄 Dashboard: Fetching verifiers...");
        await fetchAllVerifiers(token, BASE_URL);
      }

      console.log("✅ Dashboard: Background data fetch completed");
      setDataInitialized(true);
      
    } catch (err) {
      console.error("Background fetch error:", err);
      setDataInitialized(false);
    }
  };
  const handleRefresh = async () => {
    if (refreshing) return;

    try {
      setRefreshing(true);
      setDataInitialized(false);

      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      console.log("🔄 Manual refresh started...");
      
      // Force refresh data
      await fetchAllCrops(token, BASE_URL);
      await fetchAllVerifiers(token, BASE_URL);

      setDataInitialized(true);
      
      // Update counts after data is refreshed
      setTimeout(() => {
        getFarmerCount();
        getVerifierCount();
        getRecentCrops();
      }, 500);

      toast.success("Dashboard data refreshed successfully!");
    } catch (err) {
      console.error("Error refreshing dashboard:", err);
      toast.error("Failed to refresh data");
      setDataInitialized(false);
    } finally {
      setRefreshing(false);
    }
  };

  // Initialize data on mount
  useEffect(() => {
    if (!token || !role) {
      toast.error("Please login to access dashboard");
      router.push("/login");
      return;
    }

    if (role === "talukaOfficer") {
      fetchBackgroundData();
    }
  }, [token, role]);

  // Update counts when data is available (only once after initialization)
  useEffect(() => {
    if (dataInitialized && farmersData && Object.keys(farmersData).length > 0) {
      getFarmerCount();
    }
  }, [dataInitialized, farmersData]);

  useEffect(() => {
    if (dataInitialized && verifiers && verifiers.length > 0) {
      getVerifierCount();
    }
  }, [dataInitialized, verifiers]);

  useEffect(() => {
    if (
      dataInitialized &&
      crops &&
      crops.length > 0 &&
      farmersData &&
      Object.keys(farmersData).length > 0
    ) {
      getRecentCrops();
    }
  }, [dataInitialized, crops, farmersData]);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    bgColor,
    iconColor,
    loading,
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {loading ? (
              <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`${bgColor} p-3 rounded-full`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );

  if (!token || !role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Overview of your agricultural network
            </p>
            {email && (
              <p className="text-sm text-gray-500 mt-1">
                Logged in as: {email} ({role})
              </p>
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw
                className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>

        {role !== "talukaOfficer" ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-500 text-lg font-medium">
              Access denied: Only Taluka Officers can view this dashboard.
            </p>
            <p className="text-gray-600 mt-2">Your role: {role}</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
              <StatCard
                title="Total Farmers"
                value={farmerCount}
                icon={Users}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                loading={farmerLoading}
              />
              <StatCard
                title="Active Verifiers"
                value={verifierCount}
                icon={UserCheck}
                bgColor="bg-green-100"
                iconColor="text-green-600"
                loading={verifierLoading}
              />
            </div>

            {/* Recent Crops */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Crops
              </h2>

              {recentLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentCrops && recentCrops.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {recentCrops.map((crop) => (
                    <li key={crop._id} className="py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800">
                            {crop.name || "Unnamed Crop"}
                          </p>
                          <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="w-3 h-3 mr-1" />
                              <span>{crop.village || "Unknown location"}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>
                                {crop.sowingDate
                                  ? `Sown: ${crop.sowingDate}`
                                  : "No date"}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {crop.createdAt
                            ? new Date(crop.createdAt).toLocaleDateString()
                            : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No recent crops found.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
