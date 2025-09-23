"use client";
import React, { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, MapPin, LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFarmerStore } from "@/stores/farmerStore";
import { useCropStore } from "@/stores/cropStore";
import { useVerifierStore } from "@/stores/verifierStore";

export default function Dashboard() {
  const [farmerCount, setFarmerCount] = useState(0);
  const [verifierCount, setVerifierCount] = useState(0);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [verifierLoading, setVerifierLoading] = useState(false);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token, role, email, setUserData } = useUserDataStore();
  const { logout } = useAuth();
  const router = useRouter();

  // Get store functions for background data fetching
  const { fetchAllFarmers, shouldRefresh: shouldRefreshFarmers } = useFarmerStore();
  const { fetchAllCrops,fetchCropsByIds, shouldRefresh: shouldRefreshCrops } = useCropStore();
  const { fetchAllVerifiers,fetchVerifiersByIds, shouldRefresh: shouldRefreshVerifiers } = useVerifierStore();

  const handleLogout = () => {
    if (confirm("Are you sure you want to logout?")) {
      logout();
      setUserData(null); // Clear Zustand store
    }
  };

  const getFarmerCount = async () => {
    try {
      setFarmerLoading(true);
      const res = await axios.get(`${BASE_URL}/api/farmer/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) setFarmerCount(res.data.count);
    } catch (err) {
      console.error("Farmer count error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Error while calculating Farmer Count");
      }
    } finally {
      setFarmerLoading(false);
    }
  };

  const getVerifierCount = async () => {
    try {
      setVerifierLoading(true);
      const res = await axios.get(`${BASE_URL}/api/verifier/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) setVerifierCount(res.data.count);
    } catch (err) {
      console.error("Verifier count error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Error while calculating Verifier Count");
      }
    } finally {
      setVerifierLoading(false);
    }
  };

  const getRecentCrops = async () => {
    try {
      setRecentLoading(true);
      const res = await axios.get(`${BASE_URL}/api/crop/recent`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        setRecentCrops(res.data.crops || []);
      }
    } catch (err) {
      console.error("Recent crops error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Error while fetching recent crops");
      }
    } finally {
      setRecentLoading(false);
    }
  };

  // Background data fetching function
  const fetchBackgroundData = async () => {
    if (!token) return;

    try {
      // Fetch all data in background without affecting UI
      const backgroundPromises = [];

      // Only fetch if data needs refresh or is empty (based on store logic)
      if (shouldRefreshFarmers()) {
        backgroundPromises.push(fetchAllFarmers(token, BASE_URL));
      }

      if (shouldRefreshCrops()) {
        // backgroundPromises.push(fetchAllCrops(token, BASE_URL));
        backgroundPromises.push(fetchCropsByIds(BASE_URL));

      }

      if (shouldRefreshVerifiers()) {
        // backgroundPromises.push(fetchAllVerifiers(token, BASE_URL));
        backgroundPromises.push(fetchVerifiersByIds(BASE_URL));
      }

      // Run all background fetches concurrently but don't await them in UI
      Promise.allSettled(backgroundPromises).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Background fetch ${index} failed:`, result.reason);
            // Don't show toast for background failures to avoid disrupting user
          }
        });
      });

    } catch (error) {
      console.error("Background data fetch error:", error);
      // Silent fail for background operations
    }
  };

  useEffect(() => {
    console.log("Dashboard mounted with role:", role);

    // Check if user is authenticated
    if (!token || !role) {
      toast.error("Please login to access dashboard");
      router.push("/login");
      return;
    }

    // ✅ Only fetch if talukaOfficer (or whichever roles you allow)
    if (role === "talukaOfficer") {
      // Fetch dashboard-specific data (counts and recent crops)
      getFarmerCount();
      getVerifierCount();
      getRecentCrops();

      // Start background data fetching for other pages
      fetchBackgroundData();
    }
  }, [role, token, router]);

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
        {/* Header with user info and logout */}
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
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
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
            {/* Stats Cards */}
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

            {/* Recent Activity */}
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









// "use client";
// import React, { useEffect, useState } from "react";
// import { Users, UserCheck, Calendar, MapPin, LogOut } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";
// import { useUserDataStore } from "@/stores/userDataStore";
// import { useAuth } from "@/context/AuthContext";
// import { useRouter } from "next/navigation";

// export default function Dashboard() {
//   const [farmerCount, setFarmerCount] = useState(0);
//   const [verifierCount, setVerifierCount] = useState(0);
//   const [farmerLoading, setFarmerLoading] = useState(false);
//   const [verifierLoading, setVerifierLoading] = useState(false);
//   const [recentCrops, setRecentCrops] = useState([]);
//   const [recentLoading, setRecentLoading] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { token, role, email, setUserData } = useUserDataStore();
//   const { logout } = useAuth();
//   const router = useRouter();

//   const handleLogout = () => {
//     if (confirm("Are you sure you want to logout?")) {
//       logout();
//       setUserData(null); // Clear Zustand store
//     }
//   };

//   const getFarmerCount = async () => {
//     try {
//       setFarmerLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/farmer/count`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 200) setFarmerCount(res.data.count);
//     } catch (err) {
//       console.error("Farmer count error:", err);
//       if (err.response?.status === 401) {
//         toast.error("Session expired. Please login again.");
//         logout();
//       } else {
//         toast.error("Error while calculating Farmer Count");
//       }
//     } finally {
//       setFarmerLoading(false);
//     }
//   };

//   const getVerifierCount = async () => {
//     try {
//       setVerifierLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/verifier/count`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 200) setVerifierCount(res.data.count);
//     } catch (err) {
//       console.error("Verifier count error:", err);
//       if (err.response?.status === 401) {
//         toast.error("Session expired. Please login again.");
//         logout();
//       } else {
//         toast.error("Error while calculating Verifier Count");
//       }
//     } finally {
//       setVerifierLoading(false);
//     }
//   };

//   const getRecentCrops = async () => {
//     try {
//       setRecentLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/crop/recent`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (res.status === 200) {
//         setRecentCrops(res.data.crops || []);
//       }
//     } catch (err) {
//       console.error("Recent crops error:", err);
//       if (err.response?.status === 401) {
//         toast.error("Session expired. Please login again.");
//         logout();
//       } else {
//         toast.error("Error while fetching recent crops");
//       }
//     } finally {
//       setRecentLoading(false);
//     }
//   };

//   useEffect(() => {
//     console.log("Dashboard mounted with role:", role);

//     // Check if user is authenticated
//     if (!token || !role) {
//       toast.error("Please login to access dashboard");
//       router.push("/login");
//       return;
//     }

//     // ✅ Only fetch if talukaOfficer (or whichever roles you allow)
//     if (role === "talukaOfficer") {
//       getFarmerCount();
//       getVerifierCount();
//       getRecentCrops();
//     }
//   }, [role, token, router]);

//   const StatCard = ({
//     title,
//     value,
//     icon: Icon,
//     bgColor,
//     iconColor,
//     loading,
//   }) => (
//     <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-gray-600 text-sm font-medium">{title}</p>
//           <p className="text-3xl font-bold text-gray-900 mt-2">
//             {loading ? (
//               <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
//             ) : (
//               value
//             )}
//           </p>
//         </div>
//         <div className={`${bgColor} p-3 rounded-full`}>
//           <Icon className={`w-6 h-6 ${iconColor}`} />
//         </div>
//       </div>
//     </div>
//   );

//   if (!token || !role) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to login...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header with user info and logout */}
//         <div className="mb-8 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//             <p className="text-gray-600 mt-2">
//               Overview of your agricultural network
//             </p>
//             {email && (
//               <p className="text-sm text-gray-500 mt-1">
//                 Logged in as: {email} ({role})
//               </p>
//             )}
//           </div>
//           <button
//             onClick={handleLogout}
//             className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
//           >
//             <LogOut className="w-4 h-4 mr-2" />
//             Logout
//           </button>
//         </div>

//         {role !== "talukaOfficer" ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <p className="text-red-500 text-lg font-medium">
//               Access denied: Only Taluka Officers can view this dashboard.
//             </p>
//             <p className="text-gray-600 mt-2">Your role: {role}</p>
//           </div>
//         ) : (
//           <>
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
//               <StatCard
//                 title="Total Farmers"
//                 value={farmerCount}
//                 icon={Users}
//                 bgColor="bg-blue-100"
//                 iconColor="text-blue-600"
//                 loading={farmerLoading}
//               />
//               <StatCard
//                 title="Active Verifiers"
//                 value={verifierCount}
//                 icon={UserCheck}
//                 bgColor="bg-green-100"
//                 iconColor="text-green-600"
//                 loading={verifierLoading}
//               />
//             </div>

//             {/* Recent Activity */}
//             <div className="bg-white rounded-lg shadow-md p-6">
//               <h2 className="text-xl font-semibold text-gray-900 mb-4">
//                 Recent Crops
//               </h2>

//               {recentLoading ? (
//                 <div className="space-y-3">
//                   {[...Array(3)].map((_, i) => (
//                     <div key={i} className="animate-pulse">
//                       <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
//                     </div>
//                   ))}
//                 </div>
//               ) : recentCrops && recentCrops.length > 0 ? (
//                 <ul className="divide-y divide-gray-200">
//                   {recentCrops.map((crop) => (
//                     <li key={crop._id} className="py-3">
//                       <div className="flex items-center justify-between">
//                         <div className="flex-1">
//                           <p className="text-sm font-medium text-gray-800">
//                             {crop.name || "Unnamed Crop"}
//                           </p>
//                           <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
//                             <div className="flex items-center">
//                               <MapPin className="w-3 h-3 mr-1" />
//                               <span>{crop.village || "Unknown location"}</span>
//                             </div>
//                             <div className="flex items-center">
//                               <Calendar className="w-3 h-3 mr-1" />
//                               <span>
//                                 {crop.sowingDate
//                                   ? `Sown: ${crop.sowingDate}`
//                                   : "No date"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                         <div className="text-xs text-gray-400">
//                           {crop.createdAt
//                             ? new Date(crop.createdAt).toLocaleDateString()
//                             : ""}
//                         </div>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <p className="text-gray-500">No recent crops found.</p>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// // "use client";
// // import React, { useEffect, useState } from "react";
// // import { Users, UserCheck, Calendar, MapPin } from "lucide-react";
// // import axios from "axios";
// // import { toast } from "sonner";
// // import { useUserDataStore } from "@/stores/userDataStore";  // ✅ Use Zustand instead of AuthContext

// // export default function Dashboard() {
// //   const [farmerCount, setFarmerCount] = useState(0);
// //   const [verifierCount, setVerifierCount] = useState(0);
// //   const [farmerLoading, setFarmerLoading] = useState(false);
// //   const [verifierLoading, setVerifierLoading] = useState(false);
// //   const [recentCrops, setRecentCrops] = useState([]);
// //   const [recentLoading, setRecentLoading] = useState(false);

// //   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// //   // ✅ Grab token + role from Zustand
// //   const { token, role } = useUserDataStore();

// //   const getFarmerCount = async () => {
// //     try {
// //       setFarmerLoading(true);
// //       const res = await axios.get(`${BASE_URL}/api/farmer/count`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (res.status === 200) setFarmerCount(res.data.count);
// //     } catch (err) {
// //       console.error("Farmer count error:", err);
// //       toast.error("Error while calculating Farmer Count");
// //     } finally {
// //       setFarmerLoading(false);
// //     }
// //   };

// //   const getVerifierCount = async () => {
// //     try {
// //       setVerifierLoading(true);
// //       const res = await axios.get(`${BASE_URL}/api/verifier/count`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (res.status === 200) setVerifierCount(res.data.count);
// //     } catch (err) {
// //       console.error("Verifier count error:", err);
// //       if (err.response?.status === 401) {
// //         toast.error("Please login again");
// //       } else {
// //         toast.error("Error while calculating Verifier Count");
// //       }
// //     } finally {
// //       setVerifierLoading(false);
// //     }
// //   };

// //   const getRecentCrops = async () => {
// //     try {
// //       setRecentLoading(true);
// //       const res = await axios.get(`${BASE_URL}/api/crop/recent`, {
// //         headers: { Authorization: `Bearer ${token}` },
// //       });
// //       if (res.status === 200) {
// //         setRecentCrops(res.data.crops || []);
// //       }
// //     } catch (err) {
// //       console.error("Recent crops error:", err);
// //       toast.error("Error while fetching recent crops");
// //     } finally {
// //       setRecentLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     console.log("Dashboard mounted with role:", role);

// //     // ✅ Only fetch if talukaOfficer (or whichever roles you allow)
// //     if (role === "talukaOfficer") {
// //       getFarmerCount();
// //       getVerifierCount();
// //       getRecentCrops();
// //     }
// //   }, [role, token]);

// //   const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => (
// //     <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
// //       <div className="flex items-center justify-between">
// //         <div>
// //           <p className="text-gray-600 text-sm font-medium">{title}</p>
// //           <p className="text-3xl font-bold text-gray-900 mt-2">
// //             {loading ? (
// //               <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
// //             ) : (
// //               value
// //             )}
// //           </p>
// //         </div>
// //         <div className={`${bgColor} p-3 rounded-full`}>
// //           <Icon className={`w-6 h-6 ${iconColor}`} />
// //         </div>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header */}
// //         <div className="mb-8">
// //           <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
// //           <p className="text-gray-600 mt-2">
// //             Overview of your agricultural network
// //           </p>
// //         </div>

// //         {role !== "talukaOfficer" ? (
// //           <p className="text-red-500">Access denied: only Taluka Officer can view this dashboard.</p>
// //         ) : (
// //           <>
// //             {/* Stats Cards */}
// //             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
// //               <StatCard
// //                 title="Total Farmers"
// //                 value={farmerCount}
// //                 icon={Users}
// //                 bgColor="bg-blue-100"
// //                 iconColor="text-blue-600"
// //                 loading={farmerLoading}
// //               />
// //               <StatCard
// //                 title="Active Verifiers"
// //                 value={verifierCount}
// //                 icon={UserCheck}
// //                 bgColor="bg-green-100"
// //                 iconColor="text-green-600"
// //                 loading={verifierLoading}
// //               />
// //             </div>

// //             {/* Recent Activity */}
// //             <div className="bg-white rounded-lg shadow-md p-6">
// //               <h2 className="text-xl font-semibold text-gray-900 mb-4">
// //                 Recent Crops
// //               </h2>

// //               {recentLoading ? (
// //                 <div className="space-y-3">
// //                   {[...Array(3)].map((_, i) => (
// //                     <div key={i} className="animate-pulse">
// //                       <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
// //                       <div className="h-3 bg-gray-200 rounded w-1/2"></div>
// //                     </div>
// //                   ))}
// //                 </div>
// //               ) : recentCrops && recentCrops.length > 0 ? (
// //                 <ul className="divide-y divide-gray-200">
// //                   {recentCrops.map((crop) => (
// //                     <li key={crop._id} className="py-3">
// //                       <div className="flex items-center justify-between">
// //                         <div className="flex-1">
// //                           <p className="text-sm font-medium text-gray-800">
// //                             {crop.name || "Unnamed Crop"}
// //                           </p>
// //                           <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
// //                             <div className="flex items-center">
// //                               <MapPin className="w-3 h-3 mr-1" />
// //                               <span>{crop.village || "Unknown location"}</span>
// //                             </div>
// //                             <div className="flex items-center">
// //                               <Calendar className="w-3 h-3 mr-1" />
// //                               <span>
// //                                 {crop.sowingDate
// //                                   ? `Sown: ${crop.sowingDate}`
// //                                   : "No date"}
// //                               </span>
// //                             </div>
// //                           </div>
// //                         </div>
// //                         <div className="text-xs text-gray-400">
// //                           {crop.createdAt
// //                             ? new Date(crop.createdAt).toLocaleDateString()
// //                             : ""}
// //                         </div>
// //                       </div>
// //                     </li>
// //                   ))}
// //                 </ul>
// //               ) : (
// //                 <p className="text-gray-500">No recent crops found.</p>
// //               )}
// //             </div>
// //           </>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // "use client"
// // import React, { useEffect, useState, useContext } from 'react';
// // import { Users, UserCheck, Calendar, MapPin } from 'lucide-react';
// // import axios from 'axios';
// // import { toast } from 'sonner';
// // import { AuthContext } from '@/context/AuthContext';

// // export default function Dashboard() {
// //     const [farmerCount, setFarmerCount] = useState(0);
// //     const [verifierCount, setVerifierCount] = useState(0);
// //     const [farmerLoading, setFarmerLoading] = useState(false);
// //     const [verifierLoading, setVerifierLoading] = useState(false);
// //     const [recentCrops, setRecentCrops] = useState([]);
// //     const [recentLoading, setRecentLoading] = useState(false);
// //     const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// //     const { accessToken } = useContext(AuthContext);

// //     const getFarmerCount = async () => {
// //         try {
// //             setFarmerLoading(true);
// //             const res = await axios.get(`${BASE_URL}/api/farmer/count`);
// //             console.log('Farmer count response:', res.data);

// //             if (res.status === 200) {
// //                 setFarmerCount(res.data.count);
// //             }
// //         } catch (err) {
// //             console.error('Farmer count error:', err);
// //             toast.error('Error while calculating Farmer Count');
// //         } finally {
// //             setFarmerLoading(false);
// //         }
// //     }

// //     const getVerifierCount = async () => {
// //         try {
// //             setVerifierLoading(true);
// //             const res = await axios.get(`${BASE_URL}/api/verifier/count`);
// //             console.log('Verifier count response:', res.data);

// //             if (res.status === 200) {
// //                 setVerifierCount(res.data.count);
// //             }
// //         } catch (err) {
// //             console.error('Verifier count error:', err);
// //             if (err.response?.status === 401) {
// //                 toast.error('Please login again');
// //             } else {
// //                 toast.error('Error while calculating Verifier Count');
// //             }
// //         } finally {
// //             setVerifierLoading(false);
// //         }
// //     }

// //     const getRecentCrops = async () => {
// //         try {
// //             setRecentLoading(true);
// //             const res = await axios.get(`${BASE_URL}/api/crop/recent`);
// //             console.log("Recent crops response:", res.data);

// //             if (res.status === 200) {
// //                 // The server returns { message: "...", crops: [...] }
// //                 setRecentCrops(res.data.crops || []);
// //             }
// //         } catch (err) {
// //             console.error("Recent crops error:", err);
// //             if (err.response?.status === 500) {
// //                 toast.error("Server error while fetching recent crops");
// //             } else {
// //                 toast.error("Error while fetching recent crops");
// //             }
// //         } finally {
// //             setRecentLoading(false);
// //         }
// //     };

// //     useEffect(() => {
// //         console.log("Dashboard mounted");
// //         getFarmerCount();
// //         getVerifierCount();
// //         getRecentCrops();
// //     }, [accessToken]);

// //     const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => (
// //         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
// //             <div className="flex items-center justify-between">
// //                 <div>
// //                     <p className="text-gray-600 text-sm font-medium">{title}</p>
// //                     <p className="text-3xl font-bold text-gray-900 mt-2">
// //                         {loading ? (
// //                             <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
// //                         ) : (
// //                             value
// //                         )}
// //                     </p>
// //                 </div>
// //                 <div className={`${bgColor} p-3 rounded-full`}>
// //                     <Icon className={`w-6 h-6 ${iconColor}`} />
// //                 </div>
// //             </div>
// //         </div>
// //     );

// //     return (
// //         <div className="min-h-screen bg-gray-50 p-6">
// //             <div className="max-w-7xl mx-auto">
// //                 {/* Header */}
// //                 <div className="mb-8">
// //                     <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
// //                     <p className="text-gray-600 mt-2">Overview of your agricultural network</p>
// //                 </div>

// //                 {/* Stats Cards */}
// //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
// //                     <StatCard
// //                         title="Total Farmers"
// //                         value={farmerCount}
// //                         icon={Users}
// //                         bgColor="bg-blue-100"
// //                         iconColor="text-blue-600"
// //                         loading={farmerLoading}
// //                     />
// //                     <StatCard
// //                         title="Active Verifiers"
// //                         value={verifierCount}
// //                         icon={UserCheck}
// //                         bgColor="bg-green-100"
// //                         iconColor="text-green-600"
// //                         loading={verifierLoading}
// //                     />
// //                 </div>

// //                 {/* Recent Activity */}
// //                 <div className="bg-white rounded-lg shadow-md p-6">
// //                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Crops</h2>

// //                     {recentLoading ? (
// //                         <div className="space-y-3">
// //                             {[...Array(3)].map((_, i) => (
// //                                 <div key={i} className="animate-pulse">
// //                                     <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
// //                                     <div className="h-3 bg-gray-200 rounded w-1/2"></div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     ) : recentCrops && recentCrops.length > 0 ? (
// //                         <ul className="divide-y divide-gray-200">
// //                             {recentCrops.map((crop) => (
// //                                 <li key={crop._id} className="py-3">
// //                                     <div className="flex items-center justify-between">
// //                                         <div className="flex-1">
// //                                             <p className="text-sm font-medium text-gray-800">
// //                                                 {crop.name || 'Unnamed Crop'}
// //                                             </p>
// //                                             <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
// //                                                 <div className="flex items-center">
// //                                                     <MapPin className="w-3 h-3 mr-1" />
// //                                                     <span>{crop.village || 'Unknown location'}</span>
// //                                                 </div>
// //                                                 <div className="flex items-center">
// //                                                     <Calendar className="w-3 h-3 mr-1" />
// //                                                     <span>
// //                                                         {crop.sowingDate ? `Sown: ${crop.sowingDate}` : 'No date'}
// //                                                     </span>
// //                                                 </div>
// //                                             </div>
// //                                         </div>
// //                                         <div className="text-xs text-gray-400">
// //                                             {crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : ''}
// //                                         </div>
// //                                     </div>
// //                                 </li>
// //                             ))}
// //                         </ul>
// //                     ) : (
// //                         <p className="text-gray-500">No recent crops found.</p>
// //                     )}
// //                 </div>
// //             </div>
// //         </div>
// //     );
// // }

// // // "use client"
// // // import React, { useEffect, useState, useContext } from 'react';
// // // import { Users, UserCheck } from 'lucide-react';
// // // import axios from 'axios';
// // // import { toast } from 'sonner';
// // // import { AuthContext } from '@/context/AuthContext'; // Make sure to import your AuthContext

// // // export default function Dashboard() {
// // //     // Sample data - you can replace this with actual data from your API
// // //     const [farmerCount, setFarmerCount] = useState();
// // //     const [verifierCount, setVerifierCount] = useState();
// // //     const [loading, setLoading] = useState(false);
// // //     const [farmerLoading, setFarmerLoading] = useState(false); // Fixed: Separate loading states
// // //     const [verifierLoading, setVerifierLoading] = useState(false);
// // //     const [recentCrops, setRecentCrops] = useState([]);
// // //     const [recentLoading, setRecentLoading] = useState(false);
// // //     const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// // //     // const token = typeof window !== "undefined"
// // //     //     ? localStorage.getItem('Authorization')?.split(' ')[1]
// // //     //     : null;

// // //     const { accessToken } = useContext(AuthContext);

// // //     // const getFarmerCount = async () => {
// // //     //     try {
// // //     //         setLoading(true)
// // //     //         const res = await axios.get(`${BASE_URL}/api/farmer/count`, {
// // //     //             headers: {
// // //     //                 Authorization: `Bearer ${token}`
// // //     //             }
// // //     //         })
// // //     //         console.log(res.data)
// // //     //         if (res.status == 200) {
// // //     //             setFarmerCount(res.data.count)
// // //     //         }
// // //     //     } catch (err) {
// // //     //         console.error(err);
// // //     //         toast.error('Error while calulating Farmer Count')
// // //     //     } finally {
// // //     //         setLoading(false);
// // //     //     }
// // //     // }

// // //     const getFarmerCount = async () => {
// // //         try {
// // //             setFarmerLoading(true);
// // //             // ✅ CORRECT ENDPOINT: /api/farmers/count
// // //             const res = await axios.get(`${BASE_URL}/api/farmer/count`);

// // //             console.log('Farmer count response:', res.data);

// // //             if (res.status === 200) {
// // //                 setFarmerCount(res.data.count);
// // //             }
// // //         } catch (err) {
// // //             console.error('Farmer count error:', err);
// // //             toast.error('Error while calculating Farmer Count');
// // //         } finally {
// // //             setFarmerLoading(false);
// // //         }
// // //     }

// // //     // const getVerifierCount = async () => {
// // //     //     try {
// // //     //         setLoading(true);
// // //     //         const res = await axios.get(`${BASE_URL}/api/verifiers?count=true`, {
// // //     //             headers: {
// // //     //                 Authorization: `Bearer ${token}`
// // //     //             }
// // //     //         })
// // //     //         console.log(res.data)
// // //     //         if (res.status == 200) {
// // //     //             setVerifierCount(res.data.count)
// // //     //         }
// // //     //     } catch (err) {
// // //     //         console.error(err);
// // //     //         toast.error('Error while calulating Verifier Count')
// // //     //     } finally {
// // //     //         setLoading(false)
// // //     //     }
// // //     // }
// // //     const getVerifierCount = async () => {
// // //         try {
// // //             setVerifierLoading(true);
// // //             // ✅ CORRECT ENDPOINT from verifierRouter.js
// // //             const res = await axios.get(`${BASE_URL}/api/verifier/count`);

// // //             console.log('Verifier count response:', res.data);

// // //             if (res.status === 200) {
// // //                 // Your countVerifier controller returns: { message: "Count calculated for verifier", count }
// // //                 setVerifierCount(res.data.count);
// // //             }
// // //         } catch (err) {
// // //             console.error('Verifier count error:', err);
// // //             if (err.response?.status === 401) {
// // //                 toast.error('Please login again');
// // //             } else {
// // //                 toast.error('Error while calculating Verifier Count');
// // //             }
// // //         } finally {
// // //             setVerifierLoading(false);
// // //         }
// // //     }

// // //     const getRecentCrops = async () => {
// // //     try {
// // //         setRecentLoading(true);
// // //         const res = await axios.get(`${BASE_URL}/api/crop/recent`);
// // //         console.log("Recent crops:", res.data);

// // //         if (res.status === 200) {
// // //         setRecentCrops(res.data);
// // //         }
// // //     } catch (err) {
// // //         console.error("Recent crops error:", err);
// // //         toast.error("Error while fetching recent crops");
// // //     } finally {
// // //         setRecentLoading(false);
// // //     }
// // //     };

// // //     useEffect(() => {
// // //     console.log("Dashboard mounted");
// // //     getFarmerCount();
// // //     getVerifierCount();
// // //     getRecentCrops(); // 👈 fetch recent crops too
// // //     }, [accessToken]);

// // //     const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => (
// // //         <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
// // //             <div className="flex items-center justify-between">
// // //                 <div>
// // //                     <p className="text-gray-600 text-sm font-medium">{title}</p>
// // //                     <p className="text-3xl font-bold text-gray-900 mt-2">
// // //                         {loading ? (
// // //                             <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
// // //                         ) : (
// // //                             value
// // //                         )}
// // //                     </p>
// // //                 </div>
// // //                 <div className={`${bgColor} p-3 rounded-full`}>
// // //                     <Icon className={`w-6 h-6 ${iconColor}`} />
// // //                 </div>
// // //             </div>
// // //         </div>
// // //     );

// // //     useEffect(() => {
// // //         console.log("Dashboard mounted");
// // //         getFarmerCount();
// // //         getVerifierCount();
// // //     }, [accessToken]); // Added accessToken as dependency

// // //     return (
// // //         <div className="min-h-screen bg-gray-50 p-6">
// // //             <div className="max-w-7xl mx-auto">
// // //                 {/* Header */}
// // //                 <div className="mb-8">
// // //                     <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
// // //                     <p className="text-gray-600 mt-2">Overview of your agricultural network</p>
// // //                 </div>

// // //                 {/* Stats Cards */}
// // //                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
// // //                     <StatCard
// // //                         title="Total Farmers"
// // //                         value={farmerCount}
// // //                         icon={Users}
// // //                         bgColor="bg-blue-100"
// // //                         iconColor="text-blue-600"
// // //                         loading={farmerLoading} // Fixed: using correct loading state
// // //                     />
// // //                     <StatCard
// // //                         title="Active Verifiers"
// // //                         value={verifierCount}
// // //                         icon={UserCheck}
// // //                         bgColor="bg-green-100"
// // //                         iconColor="text-green-600"
// // //                         loading={verifierLoading} // Fixed: using correct loading state
// // //                     />
// // //                 </div>

// // //                 {/* Additional Dashboard Content */}
// // //                 {/* <div className="bg-white rounded-lg shadow-md p-6">
// // //                     <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
// // //                     <div className="text-gray-600">
// // //                         <p>Recent activity and updates will appear here...</p>
// // //                     </div>
// // //                 </div> */}
// // //                 {/* Recent Activity */}
// // //                 <div className="bg-white rounded-lg shadow-md p-6">
// // //                 <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>

// // //                 {recentLoading ? (
// // //                     <p className="text-gray-500">Loading recent crops...</p>
// // //                 ) : recentCrops.length > 0 ? (
// // //                     <ul className="divide-y divide-gray-200">
// // //                     {recentCrops.slice(0, 5).map((crop) => (
// // //                         <li key={crop.id} className="py-3 flex justify-between items-center">
// // //                         <div>
// // //                             <p className="text-sm font-medium text-gray-800">
// // //                             {crop.name} <span className="text-gray-500">by {crop.farmer}</span>
// // //                             </p>
// // //                             <p className="text-xs text-gray-500">
// // //                             {new Date(crop.createdAt).toLocaleString()}
// // //                             </p>
// // //                         </div>
// // //                         </li>
// // //                     ))}
// // //                     </ul>
// // //                 ) : (
// // //                     <p className="text-gray-500">No recent crops found.</p>
// // //                 )}
// // //                 </div>

// // //             </div>
// // //         </div>
// // //     );
// // // }
