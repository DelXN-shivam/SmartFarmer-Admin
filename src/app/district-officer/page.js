"use client";
import React, { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, MapPin, LogOut, RefreshCw } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useAdminStore } from "@/stores/adminStore";
import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  const [talukaOfficerCount, setTalukaOfficerCount] = useState(0);
  const [farmerCount, setFarmerCount] = useState(0);
  const [talukaOfficerLoading, setTalukaOfficerLoading] = useState(false);
  const [farmerLoading, setFarmerLoading] = useState(false);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token, role, email, setUserData } = useUserDataStore();
  const { logout } = useAuth();
  const router = useRouter();

  // Add adminStore
  const { quickRefresh: refreshAdminData, shouldRefresh: shouldRefreshAdmin, talukaOfficers } = useAdminStore();

  // ✅ Logout function - now handled by LogoutButton component

  const getTalukaOfficerCount = async () => {
    try {
      setTalukaOfficerLoading(true);
      // Use adminStore data if available, else fetch from API
      if (talukaOfficers && talukaOfficers.length > 0) {
        setTalukaOfficerCount(talukaOfficers.length);
      } else {
        const res = await axios.get(`${BASE_URL}/api/taluka-officer/count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200) setTalukaOfficerCount(res.data.count);
      }
    } catch (err) {
      console.error("Taluka Officer count error:", err);
      if (err.response?.status === 401) {
        toast.error("Session expired. Please login again.");
        logout();
      } else {
        toast.error("Error while calculating Taluka Officer Count");
      }
    } finally {
      setTalukaOfficerLoading(false);
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

  // Background data fetching with adminStore
  const fetchBackgroundData = async () => {
    if (!token) return;

    try {
      const backgroundPromises = [];

      // Add admin data refresh
      if (shouldRefreshAdmin()) {
        backgroundPromises.push(refreshAdminData(token, BASE_URL, role));
      }

      Promise.allSettled(backgroundPromises).then((results) => {
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            console.error(`Background fetch ${index} failed:`, result.reason);
          }
        });
      });

    } catch (error) {
      console.error("Background data fetch error:", error);
    }
  };

  // Refresh function with adminStore integration
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      // Refresh all data including admin data
      await Promise.allSettled([
        getTalukaOfficerCount(),
        getFarmerCount(),
        getRecentCrops(),
        refreshAdminData(token, BASE_URL, role) // Force refresh admin data
      ]);

      toast.success("Dashboard data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log("Dashboard mounted with role:", role);

    if (!token || !role) {
      toast.error("Please login to access dashboard");
      router.push("/login");
      return;
    }

    if (role === "districtOfficer") {
      getTalukaOfficerCount();
      getFarmerCount();
      getRecentCrops();
      fetchBackgroundData();
    }
  }, [role, token, router, talukaOfficers]);

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
          
          <div className="flex items-center gap-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <LogoutButton variant="header">
              Logout
            </LogoutButton>
          </div>
        </div>

        {role !== "districtOfficer" ? (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-red-500 text-lg font-medium">
              Access denied: Only District Officers can view this dashboard.
            </p>
            <p className="text-gray-600 mt-2">Your role: {role}</p>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
              <StatCard
                title="Total Taluka Officers"
                value={talukaOfficerCount}
                icon={UserCheck}
                bgColor="bg-blue-100"
                iconColor="text-blue-600"
                loading={talukaOfficerLoading}
              />
              <StatCard
                title="Total Farmers"
                value={farmerCount}
                icon={Users}
                bgColor="bg-green-100"
                iconColor="text-green-600"
                loading={farmerLoading}
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
// import { useAdminStore } from "@/stores/adminStore"; // Import adminStore


// export default function Dashboard() {
//   const [talukaOfficerCount, setTalukaOfficerCount] = useState(0);
//   const [farmerCount, setFarmerCount] = useState(0);
//   const [talukaOfficerLoading, setTalukaOfficerLoading] = useState(false);
//   const [farmerLoading, setFarmerLoading] = useState(false);
//   const [recentCrops, setRecentCrops] = useState([]);
//   const [recentLoading, setRecentLoading] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { token, role, email, setUserData } = useUserDataStore();
//   const { logout } = useAuth();
//   const router = useRouter();

//   // Add adminStore
//   const { quickRefresh: refreshAdminData, shouldRefresh: shouldRefreshAdmin, talukaOfficers } = useAdminStore();

//   const handleLogout = () => {
//     if (confirm("Are you sure you want to logout?")) {
//       logout();
//       setUserData(null); // Clear Zustand store
//     }
//   };

//   const getTalukaOfficerCount = async () => {
//     try {
//       setTalukaOfficerLoading(true);
//       // Use adminStore data if available, else fetch from API
//       if (talukaOfficers && talukaOfficers.length > 0) {
//         setTalukaOfficerCount(talukaOfficers.length);
//       } else {
//         const res = await axios.get(`${BASE_URL}/api/taluka-officer/count`, {
//           headers: { Authorization: `Bearer ${token}` },
//         });
//         if (res.status === 200) setTalukaOfficerCount(res.data.count);
//       }
//     } catch (err) {
//       console.error("Taluka Officer count error:", err);
//       if (err.response?.status === 401) {
//         toast.error("Session expired. Please login again.");
//         logout();
//       } else {
//         toast.error("Error while calculating Taluka Officer Count");
//       }
//     } finally {
//       setTalukaOfficerLoading(false);
//     }
//   }

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


//   // Background data fetching with adminStore
//   const fetchBackgroundData = async () => {
//     if (!token) return;

//     try {
//       const backgroundPromises = [];

//       // Add admin data refresh
//       if (shouldRefreshAdmin()) {
//         backgroundPromises.push(refreshAdminData(token, BASE_URL, role));
//       }

//       Promise.allSettled(backgroundPromises).then((results) => {
//         results.forEach((result, index) => {
//           if (result.status === 'rejected') {
//             console.error(`Background fetch ${index} failed:`, result.reason);
//           }
//         });
//       });

//     } catch (error) {
//       console.error("Background data fetch error:", error);
//     }
//   };

//   // Refresh function with adminStore integration
//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       if (!token) {
//         toast.error("Session expired. Please login again.");
//         router.push("/login");
//         return;
//       }

//       // Refresh all data including admin data
//       await Promise.allSettled([
//         getTalukaOfficerCount(),
//         getFarmerCount(),
//         getRecentCrops(),
//         refreshAdminData(token, BASE_URL, role) // Force refresh admin data
//       ]);

//       toast.success("Dashboard data refreshed successfully!");
//     } catch (error) {
//       console.error("Error refreshing dashboard data:", error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setRefreshing(false);
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

//     // ✅ Only fetch if districtOfficer
//     if (role === "districtOfficer") {
//       getTalukaOfficerCount();
//       getFarmerCount();
//       getRecentCrops();
//       fetchBackgroundData();
//     }
//   }, [role, token, router, talukaOfficers]);

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

//         {role !== "districtOfficer" ? (
//           <div className="bg-white rounded-lg shadow-md p-6 text-center">
//             <p className="text-red-500 text-lg font-medium">
//               Access denied: Only District Officers can view this dashboard.
//             </p>
//             <p className="text-gray-600 mt-2">Your role: {role}</p>
//           </div>
//         ) : (
//           <>
//             {/* Stats Cards */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
//               <StatCard
//                 title="Total Taluka Officers"
//                 value={talukaOfficerCount}
//                 icon={UserCheck}
//                 bgColor="bg-blue-100"
//                 iconColor="text-blue-600"
//                 loading={talukaOfficerLoading}
//               />
//               <StatCard
//                 title="Total Farmers"
//                 value={farmerCount}
//                 icon={Users}
//                 bgColor="bg-green-100"
//                 iconColor="text-green-600"
//                 loading={farmerLoading}
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



// "use client";
// import React, { useEffect, useState, useContext } from "react";
// import { Users, UserCheck, X } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";
// import { AuthContext } from "@/context/AuthContext";

// export default function Dashboard() {
//   const [farmerCount, setFarmerCount] = useState();
//   const [verifierCount, setVerifierCount] = useState();
//   const [loading, setLoading] = useState(false);
//   const [farmerLoading, setFarmerLoading] = useState(false);
//   const [verifierLoading, setVerifierLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [adminForm, setAdminForm] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { accessToken } = useContext(AuthContext);

//   const getFarmerCount = async () => {
//     try {
//       setFarmerLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/farmer/count`);
//       console.log("Farmer count response:", res.data);
//       if (res.status === 200) {
//         setFarmerCount(res.data.count);
//       }
//     } catch (err) {
//       console.error("Farmer count error:", err);
//       toast.error("Error while calculating Farmer Count");
//     } finally {
//       setFarmerLoading(false);
//     }
//   };

//   const getVerifierCount = async () => {
//     try {
//       setVerifierLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/verifier/count`);
//       console.log("Verifier count response:", res.data);
//       if (res.status === 200) {
//         setVerifierCount(res.data.count);
//       }
//     } catch (err) {
//       console.error("Verifier count error:", err);
//       if (err.response?.status === 401) {
//         toast.error("Please login again");
//       } else {
//         toast.error("Error while calculating Verifier Count");
//       }
//     } finally {
//       setVerifierLoading(false);
//     }
//   };

//   const validateForm = () => {
//     const errors = {};
//     if (!adminForm.name.trim()) errors.name = "Name is required";
//     if (!adminForm.email.trim()) {
//       errors.email = "Email is required";
//     } else if (!/^\S+@\S+\.\S+$/.test(adminForm.email)) {
//       errors.email = "Email is invalid";
//     }
//     if (!adminForm.phone) {
//       errors.phone = "Phone is required";
//     } else if (
//       isNaN(adminForm.phone) ||
//       adminForm.phone.toString().length !== 10
//     ) {
//       errors.phone = "Phone must be a 10-digit number";
//     }
//     if (!adminForm.password) {
//       errors.password = "Password is required";
//     } else if (adminForm.password.length < 6) {
//       errors.password = "Password must be at least 6 characters";
//     }
//     return errors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const response = await axios.post(
//         `${BASE_URL}/api/auth/super-admin/register`,
//         {
//           ...adminForm,
//           role: "admin",
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//         }
//       );

//       if (response.status === 201) {
//         toast.success("Admin created successfully");
//         setShowModal(false);
//         setAdminForm({ name: "", email: "", phone: "", password: "" });
//         setFormErrors({});
//       }
//     } catch (error) {
//       console.error("Error creating admin:", error);
//       if (error.response?.status === 409) {
//         toast.error("Admin with this email already exists");
//       } else {
//         toast.error("Failed to create admin");
//       }
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setAdminForm((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     // Clear error when user starts typing
//     if (formErrors[name]) {
//       setFormErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

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

//   useEffect(() => {
//     console.log("Dashboard mounted");
//     getFarmerCount();
//     getVerifierCount();
//   }, [accessToken]);

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <span>
//               <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//               <p className="text-gray-600 mt-2">
//                 Overview of your admin network
//               </p>
//             </span>
//             <button
//               onClick={() => setShowModal(true)}
//               className="px-4 py-2 font-bold bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors shadow-sm whitespace-nowrap"
//             >
//               Add Admin
//             </button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
//           <StatCard
//             title="Total District Officers"
//             value={farmerCount}
//             icon={Users}
//             bgColor="bg-blue-100"
//             iconColor="text-blue-600"
//             loading={farmerLoading}
//           />
//           <StatCard
//             title="Total Taluka Officers"
//             value={verifierCount}
//             icon={UserCheck}
//             bgColor="bg-green-100"
//             iconColor="text-green-600"
//             loading={verifierLoading}
//           />
//         </div>

//         {/* Additional Dashboard Content */}
//         <div className="bg-white rounded-lg shadow-md p-6">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Recent Activity
//           </h2>
//           <div className="text-gray-600">
//             <p>Recent activity and updates will appear here...</p>
//           </div>
//         </div>
//       </div>

//       {/* Add Admin Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
//           <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
//             <div className="flex justify-between items-center p-6 border-b">
//               <h3 className="text-xl font-semibold text-gray-900">
//                 Add New Admin
//               </h3>
//               <button
//                 onClick={() => {
//                   setShowModal(false);
//                   setFormErrors({});
//                 }}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="p-6 space-y-4">
//               <div>
//                 <label
//                   htmlFor="name"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Full Name
//                 </label>
//                 <input
//                   type="text"
//                   id="name"
//                   name="name"
//                   value={adminForm.name}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md ${
//                     formErrors.name ? "border-red-500" : "border-gray-300"
//                   }`}
//                   placeholder="Enter full name"
//                 />
//                 {formErrors.name && (
//                   <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="email"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={adminForm.email}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md ${
//                     formErrors.email ? "border-red-500" : "border-gray-300"
//                   }`}
//                   placeholder="Enter email address"
//                 />
//                 {formErrors.email && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {formErrors.email}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="phone"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   id="phone"
//                   name="phone"
//                   value={adminForm.phone}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md ${
//                     formErrors.phone ? "border-red-500" : "border-gray-300"
//                   }`}
//                   placeholder="Enter 10-digit phone number"
//                 />
//                 {formErrors.phone && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {formErrors.phone}
//                   </p>
//                 )}
//               </div>

//               <div>
//                 <label
//                   htmlFor="password"
//                   className="block text-sm font-medium text-gray-700 mb-1"
//                 >
//                   Password
//                 </label>
//                 <input
//                   type="password"
//                   id="password"
//                   name="password"
//                   value={adminForm.password}
//                   onChange={handleChange}
//                   className={`w-full px-3 py-2 border rounded-md ${
//                     formErrors.password ? "border-red-500" : "border-gray-300"
//                   }`}
//                   placeholder="Enter password"
//                 />
//                 {formErrors.password && (
//                   <p className="mt-1 text-sm text-red-600">
//                     {formErrors.password}
//                   </p>
//                 )}
//               </div>

//               <div className="flex justify-end gap-3 pt-4">
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setShowModal(false);
//                     setFormErrors({});
//                   }}
//                   className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   disabled={submitting}
//                   className="px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 disabled:opacity-50"
//                 >
//                   {submitting ? "Creating..." : "Create Admin"}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
