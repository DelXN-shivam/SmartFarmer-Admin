// app/farmer/all/page.js
"use client";
import { useEffect, useState } from "react";
import FarmerCard from "@/components/ui/FarmerCard";
import { X, XCircle, RefreshCw } from 'lucide-react';
import GoToTopButton from "@/components/ui/GoToTopButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFarmerStore } from "@/stores/farmerStore";
import { useAuth } from "@/context/AuthContext";

export default function FarmersPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user } = useAuth();
  
  const {
    farmers,
    crops,
    loading,
    error,
    fetchAllFarmers,
    shouldRefresh
  } = useFarmerStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [filteredFarmers, setFilteredFarmers] = useState([]);

  // Function to initialize data
  const initializeData = async (forceRefresh = false) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error('Authentication token not found. Redirecting...');
        router.push('/login');
        return;
      }

      // Fetch data if forced refresh, should refresh, or no farmers
      if (forceRefresh || shouldRefresh() || farmers.length === 0) {
        await fetchAllFarmers(token, BASE_URL);
        toast.success("Data refreshed successfully!");
      }
    } catch (err) {
      console.error("Error initializing data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization");
        toast.error('Authentication failed please login again');
        router.push('/login');
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, [BASE_URL, router, fetchAllFarmers, shouldRefresh, farmers.length]);

  // Filter farmers based on taluka, search, and status
  useEffect(() => {
    if (user?.taluka && farmers.length > 0) {
      const filtered = farmers.filter(farmer => {
        const matchesTaluka = farmer.taluka === user.taluka;
        const matchesSearch = farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
          farmer.applicationStatus === statusFilter;

        return matchesTaluka && matchesSearch && matchesStatus;
      });
      setFilteredFarmers(filtered);
    } else {
      // If no taluka filter or no user taluka, use regular filtering
      const filtered = farmers.filter(farmer => {
        const matchesSearch = farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" ||
          farmer.applicationStatus === statusFilter;

        return matchesSearch && matchesStatus;
      });
      setFilteredFarmers(filtered);
    }
  }, [farmers, user?.taluka, searchTerm, statusFilter]);

  if (loading && farmers.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading farmers...</p>
      </div>
    );
  }

  if (error && farmers.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Farmers Directory</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={() => initializeData(true)}
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
            onClick={() => initializeData(true)}
            disabled={refreshing}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

      <GoToTopButton />
    </div>
  );
}

















// // app/farmer/all/page.js
// "use client";
// import { useEffect, useState } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, XCircle, RefreshCw } from 'lucide-react';
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { useFarmerStore } from "@/stores/farmerStore";
// import { useAuth } from "@/context/AuthContext";

// export default function FarmersPage() {
//   const router = useRouter();
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { user } = useAuth();
  
//   const {
//     farmers,
//     crops,
//     loading,
//     error,
//     fetchAllFarmers,
//     shouldRefresh
//   } = useFarmerStore();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [refreshing, setRefreshing] = useState(false);
//   const [filteredFarmers, setFilteredFarmers] = useState([]);

//   // Function to initialize data
//   const initializeData = async (forceRefresh = false) => {
//     try {
//       setRefreshing(true);
//       const token = localStorage.getItem("Authorization")?.split(" ")[1];
//       if (!token) {
//         toast.error('Authentication token not found. Redirecting...');
//         router.push('/login');
//         return;
//       }

//       // Fetch data if forced refresh, should refresh, or no farmers
//       if (forceRefresh || shouldRefresh() || farmers.length === 0) {
//         await fetchAllFarmers(token, BASE_URL);
//         toast.success("Data refreshed successfully!");
//       }
//     } catch (err) {
//       console.error("Error initializing data:", err);
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization");
//         toast.error('Authentication failed please login again');
//         router.push('/login');
//       }
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     initializeData();
//   }, [BASE_URL, router, fetchAllFarmers, shouldRefresh, farmers.length]);

//   // Filter farmers based on taluka, search, and status
//   useEffect(() => {
//     if (user?.taluka && farmers.length > 0) {
//       const filtered = farmers.filter(farmer => {
//         const matchesTaluka = farmer.taluka === user.taluka;
//         const matchesSearch = farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === "all" ||
//           farmer.applicationStatus === statusFilter;

//         return matchesTaluka && matchesSearch && matchesStatus;
//       });
//       setFilteredFarmers(filtered);
//     } else {
//       // If no taluka filter or no user taluka, use regular filtering
//       const filtered = farmers.filter(farmer => {
//         const matchesSearch = farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//           farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === "all" ||
//           farmer.applicationStatus === statusFilter;

//         return matchesSearch && matchesStatus;
//       });
//       setFilteredFarmers(filtered);
//     }
//   }, [farmers, user?.taluka, searchTerm, statusFilter]);

//   if (loading && farmers.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading farmers...</p>
//       </div>
//     );
//   }

//   if (error && farmers.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Farmers Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <XCircle className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={() => initializeData(true)}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
//               >
//                 Try again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-10">
//         <h1 className="text-3xl font-bold text-gray-900">
//           {user?.taluka ? `${user.taluka} Farmers Directory` : "Farmers Directory"}
//         </h1>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-grow">
//             <input
//               type="text"
//               placeholder="Search by name, village or district..."
//               className="w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             )}
//           </div>
//           <button
//             onClick={() => initializeData(true)}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }