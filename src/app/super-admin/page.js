"use client";
import React, { useEffect, useState, useContext } from "react";
import { Users, UserCheck, Calendar, MapPin, RefreshCw, LogOut } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { AuthContext } from "@/context/AuthContext";
import { useCropStore } from "@/stores/cropStore";
import LogoutButton from "@/components/LogoutButton";

export default function Dashboard() {
  const [DistrictOfficerCount, setDistrictOfficerCount] = useState();
  const [TalukaOfficerCount, setTalukaOfficerCount] = useState();
  const [DistrictOfficerLoading, setDistrictOfficerLoading] = useState(false);
  const [TalukaOfficerLoading, setTalukaOfficerLoading] = useState(false);
  const [recentCrops, setRecentCrops] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false); // State for logout confirmation modal

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user, logout } = useContext(AuthContext); // Added logout from AuthContext
  const accessToken = user?.token;

  // Crop Store
  const { crops, farmersData, fetchAllCrops, shouldRefresh } = useCropStore();

  // ✅ Logout function - now handled by LogoutButton component

  const getDistrictOfficerCount = async () => {
    try {
      setDistrictOfficerLoading(true);
      const res = await axios.get(`${BASE_URL}/api/district-officer/count`);
      if (res.status === 200) {
        setDistrictOfficerCount(res.data.count);
      }
    } catch (err) {
      console.error("District Officer count error:", err);
      toast.error("Error while calculating District Officer Count");
    } finally {
      setDistrictOfficerLoading(false);
    }
  };

  const getTalukaOfficerCount = async () => {
    try {
      setTalukaOfficerLoading(true);
      const res = await axios.get(`${BASE_URL}/api/taluka-officer/count`);
      if (res.status === 200) {
        setTalukaOfficerCount(res.data.count);
      }
    } catch (err) {
      console.error("Taluka officer count error:", err);
      toast.error("Error while calculating Taluka officer Count");
    } finally {
      setTalukaOfficerLoading(false);
    }
  };

  const getRecentCrops = async () => {
    try {
      setRecentLoading(true);

      if (crops && crops.length > 0) {
        const sortedCrops = [...crops].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRecentCrops(sortedCrops.slice(0, 5));
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

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      if (!accessToken) {
        toast.error("Session expired. Please login again.");
        return;
      }

      // Refresh crops and other data
      await fetchAllCrops(accessToken, BASE_URL);

      // Refresh counts and recent crops
      await Promise.all([getDistrictOfficerCount(), getTalukaOfficerCount()]);
      getRecentCrops();

      toast.success("Dashboard data refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  
  useEffect(() => {
    getDistrictOfficerCount();
    getTalukaOfficerCount();

    if (shouldRefresh()) {
      fetchAllCrops(accessToken, BASE_URL);
    }

    getRecentCrops();
  }, [accessToken]);

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => (
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of your admin network</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <LogoutButton variant="header">
              Logout
            </LogoutButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total District Officers"
            value={DistrictOfficerCount}
            icon={Users}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            loading={DistrictOfficerLoading}
          />
          <StatCard
            title="Total Taluka Officers"
            value={TalukaOfficerCount}
            icon={UserCheck}
            bgColor="bg-green-100"
            iconColor="text-green-600"
            loading={TalukaOfficerLoading}
          />
        </div>

        {/* Recent Crops */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Crops</h2>

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
                      <p className="text-sm font-medium text-gray-800">{crop.name || "Unnamed Crop"}</p>
                      <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          <span>{crop.village || "Unknown location"}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>
                            {crop.sowingDate ? `Sown: ${crop.sowingDate}` : "No date"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent crops found.</p>
          )}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Are you sure you want to logout?</h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <LogoutButton variant="header">
                Logout
              </LogoutButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}





// "use client";
// import React, { useEffect, useState, useContext } from "react";
// import { Users, UserCheck, X } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";
// import { AuthContext } from "@/context/AuthContext";
// import { useAdminStore } from "@/stores/adminStore"; // Import adminStore


// export default function Dashboard() {
//   const [DistrictOfficerCount, setDistrictOfficerCount] = useState();
//   const [TalukaOfficerCount, setTalukaOfficerCount] = useState();
//   const [DistrictOfficerLoading, setDistrictOfficerLoading] = useState(false);
//   const [TalukaOfficerLoading, setTalukaOfficerLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);

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


//   // Use adminStore
//   const { 
//     districtOfficers, 
//     talukaOfficers, 
//     quickRefresh: refreshAdminData, 
//     shouldRefresh: shouldRefreshAdmin,
//     fetchAllDistrictOfficers,
//     fetchAllTalukaOfficers 
//   } = useAdminStore();

//   const getDistrictOfficerCount = async () => {
//     try {
//       setDistrictOfficerLoading(true);
//       // Use adminStore data if available
//       if (districtOfficers && districtOfficers.length > 0) {
//         setDistrictOfficerCount(districtOfficers.length);
//       } else {
//         const res = await axios.get(`${BASE_URL}/api/district-officer/count`);
//         if (res.status === 200) {
//           setDistrictOfficerCount(res.data.count);
//         }
//       }
//     } catch (err) {
//       console.error("District Officer count error:", err);
//       toast.error("Error while calculating District Officer Count");
//     } finally {
//       setDistrictOfficerLoading(false);
//     }
//   };

//   const getTalukaOfficerCount = async () => {
//     try {
//       setTalukaOfficerLoading(true);
//       // Use adminStore data if available
//       if (talukaOfficers && talukaOfficers.length > 0) {
//         setTalukaOfficerCount(talukaOfficers.length);
//       } else {
//         const res = await axios.get(`${BASE_URL}/api/taluka-officer/count`);
//         if (res.status === 200) {
//           setTalukaOfficerCount(res.data.count);
//         }
//       }
//     } catch (err) {
//       console.error("Taluka officer count error:", err);
//       toast.error("Error while calculating Taluka officer Count");
//     } finally {
//       setTalukaOfficerLoading(false);
//     }
//   };

//   // Background data fetching
//   const fetchBackgroundData = async () => {
//     if (!accessToken) return;

//     try {
//       const backgroundPromises = [];

//       if (shouldRefreshAdmin()) {
//         backgroundPromises.push(refreshAdminData(accessToken, BASE_URL, 'superAdmin'));
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

//     // Refresh function with adminStore integration
//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       if (!accessToken) {
//         toast.error("Session expired. Please login again.");
//         return;
//       }

//       // Refresh all data including admin data
//       await Promise.allSettled([
//         getDistrictOfficerCount(),
//         getTalukaOfficerCount(),
//         refreshAdminData(accessToken, BASE_URL, 'superAdmin') // Force refresh admin data
//       ]);

//       toast.success("Dashboard data refreshed successfully!");
//     } catch (error) {
//       console.error("Error refreshing dashboard data:", error);
//       toast.error("Failed to refresh data");
//     } finally {
//       setRefreshing(false);
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

//   // Update the form submission to use adminStore
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const errors = validateForm();
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }

//     setSubmitting(true);
//     try {
//       // You can also integrate this with adminStore if you add create methods
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
//         // Refresh admin data after creating new admin
//         refreshAdminData(accessToken, BASE_URL, 'superAdmin');
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
//     getDistrictOfficerCount();
//     getTalukaOfficerCount();
//     fetchBackgroundData();
//   }, [accessToken, districtOfficers, talukaOfficers]);

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
//             value={DistrictOfficerCount}
//             icon={Users}
//             bgColor="bg-blue-100"
//             iconColor="text-blue-600"
//             loading={DistrictOfficerLoading}
//           />
//           <StatCard
//             title="Total Taluka Officers"
//             value={TalukaOfficerCount}
//             icon={UserCheck}
//             bgColor="bg-green-100"
//             iconColor="text-green-600"
//             loading={TalukaOfficerLoading}
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









// "use client";
// import React, { useEffect, useState, useContext } from "react";
// import { Users, UserCheck, X } from "lucide-react";
// import axios from "axios";
// import { toast } from "sonner";
// import { AuthContext } from "@/context/AuthContext";

// export default function Dashboard() {
//   const [farmerCount, setFarmerCount] = useState();
//   const [verifierCount, setVerifierCount] = useState();
//   const [farmerLoading, setFarmerLoading] = useState(false);
//   const [verifierLoading, setVerifierLoading] = useState(false);
//   const [showModal, setShowModal] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//   });
//   const [loading, setLoading] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { accessToken } = useContext(AuthContext);

//   const getFarmerCount = async () => {
//     try {
//       setFarmerLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/farmer/count`);
//       if (res.status === 200) {
//         setFarmerCount(res.data.count);
//       }
//     } catch (err) {
//       toast.error("Error while calculating Farmer Count");
//     } finally {
//       setFarmerLoading(false);
//     }
//   };

//   const getVerifierCount = async () => {
//     try {
//       setVerifierLoading(true);
//       const res = await axios.get(`${BASE_URL}/api/verifier/count`);
//       if (res.status === 200) {
//         setVerifierCount(res.data.count);
//       }
//     } catch (err) {
//       toast.error("Error while calculating Verifier Count");
//     } finally {
//       setVerifierLoading(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       const res = await axios.post(`${BASE_URL}/api/superadmin`, formData, {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       if (res.status === 201) {
//         toast.success("Admin added successfully!");
//         setFormData({ name: "", email: "", phone: "", password: "" });
//         setShowModal(false);
//       }
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Error adding admin");
//     } finally {
//       setLoading(false);
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

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-40">
//           <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
//             <button
//               onClick={() => setShowModal(false)}
//               className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
//             >
//               <X className="w-5 h-5" />
//             </button>
//             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
//               Add New Admin
//             </h2>
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <input
//                 type="text"
//                 name="name"
//                 placeholder="Name"
//                 value={formData.name}
//                 onChange={handleInputChange}
//                 className="w-full border rounded-md px-3 py-2"
//                 required
//               />
//               <input
//                 type="email"
//                 name="email"
//                 placeholder="Email"
//                 value={formData.email}
//                 onChange={handleInputChange}
//                 className="w-full border rounded-md px-3 py-2"
//                 required
//               />
//               <input
//                 type="number"
//                 name="phone"
//                 placeholder="Phone"
//                 value={formData.phone}
//                 onChange={handleInputChange}
//                 className="w-full border rounded-md px-3 py-2"
//                 required
//               />
//               <input
//                 type="password"
//                 name="password"
//                 placeholder="Password"
//                 value={formData.password}
//                 onChange={handleInputChange}
//                 className="w-full border rounded-md px-3 py-2"
//                 required
//               />
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full bg-green-700 text-white py-2 rounded-md hover:bg-green-800 transition-colors"
//               >
//                 {loading ? "Adding..." : "Add Admin"}
//               </button>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
