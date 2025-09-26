"use client";
import { useState, useEffect, useMemo } from "react";
import FarmerCard from "@/components/ui/FarmerCard";
import { X, RefreshCw } from "lucide-react";
import GoToTopButton from "@/components/ui/GoToTopButton";
import { toast } from "sonner";

import { useCropStore } from "@/stores/cropStore"; 
import { useUserDataStore } from "@/stores/userDataStore";

export default function FarmersPage() {
  const {
    farmersData, 
    crops,
    fetchCropsByIds,
    shouldRefresh,
    loading,
    error,
  } = useCropStore(); 

  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useUserDataStore(); 

  // Fetch crops (and farmers) on mount
  useEffect(() => {
    const initializeData = async () => {
      setRefreshing(true);
      try {
        await fetchCropsByIds(BASE_URL);
        toast.success("Farmers data loaded successfully!");
      } catch (err) {
        toast.error("Failed to fetch from API, using cached data.");
      } finally {
        setRefreshing(false);
      }
    };
    initializeData();
  }, [fetchCropsByIds, BASE_URL]);

  // Filtered farmers using useMemo for performance
  const filteredFarmers = useMemo(() => {
    const farmersArray = Object.values(farmersData || {});
    if (!farmersArray.length) return [];

    const term = searchTerm.toLowerCase();
    return farmersArray.filter((farmer) => {
      return (
        farmer.name?.toLowerCase().includes(term) ||
        farmer.village?.toLowerCase().includes(term) ||
        farmer.district?.toLowerCase().includes(term)
      );
    });
  }, [farmersData, searchTerm]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchCropsByIds(BASE_URL);
      toast.success("Data refreshed successfully!");
    } catch (err) {
      toast.error("Failed to refresh data.");
    } finally {
      setRefreshing(false);
    }
  };

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
        <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>

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

      {/* Only farmers who have crops */}
      <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

      <GoToTopButton />
    </div>
  );
}








// "use client";
// import { useState, useEffect, useMemo } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, RefreshCw } from "lucide-react";
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { toast } from "sonner";

// import { useCropStore } from "@/stores/cropStore"; 
// import { useUserDataStore } from "@/stores/userDataStore";

// export default function FarmersPage() {
//   const {
//     farmersData, 
//     crops,
//     fetchCropsByIds,
//     shouldRefresh,
//     loading,
//     error,
//   } = useCropStore(); 

//   const [searchTerm, setSearchTerm] = useState("");
//   const [refreshing, setRefreshing] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { token } = useUserDataStore(); 

//   // Fetch crops (and farmers) on mount
//   useEffect(() => {
//     const initializeData = async () => {
//       setRefreshing(true);
//       try {
//         await fetchCropsByIds(BASE_URL);
//         toast.success("Farmers data loaded successfully!");
//       } catch (err) {
//         toast.error("Failed to fetch from API, using cached data.");
//       } finally {
//         setRefreshing(false);
//       }
//     };
//     initializeData();
//   }, [fetchCropsByIds, BASE_URL]);

//   // Filtered farmers using useMemo for performance
//   const filteredFarmers = useMemo(() => {
//     const farmersArray = Object.values(farmersData || {});
//     if (!farmersArray.length) return [];

//     const term = searchTerm.toLowerCase();
//     return farmersArray.filter((farmer) => {
//       return (
//         farmer.name?.toLowerCase().includes(term) ||
//         farmer.village?.toLowerCase().includes(term) ||
//         farmer.district?.toLowerCase().includes(term)
//       );
//     });
//   }, [farmersData, searchTerm]);

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await fetchCropsByIds(BASE_URL);
//       toast.success("Data refreshed successfully!");
//     } catch (err) {
//       toast.error("Failed to refresh data.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading farmers...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Farmers Directory
//         </h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <X className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={handleRefresh}
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
//         <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>

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
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw
//               className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* Only farmers who have crops */}
//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }













// "use client";
// import { useState, useEffect } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, RefreshCw } from "lucide-react";
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { toast } from "sonner";

// import { useCropStore } from "@/stores/cropStore"; // ✅ yaha se lena hai
// import { useUserDataStore } from "@/stores/userDataStore";


// export default function FarmersPage() {
//   const {
//     farmersData, // ✅ cropStore me ye object hai
//     crops,
//     fetchCropsByIds,
//     shouldRefresh,
//     loading,
//     error,
//   } = useCropStore(); // ✅ switch to cropStore

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredFarmers, setFilteredFarmers] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { token } = useUserDataStore(); // ✅ get token from zustand store

//   // Fetch crops (and farmers) on mount
//   useEffect(() => {
//   const initializeData = async () => {
//     setRefreshing(true);
//     try {
//       await fetchCropsByIds(BASE_URL);
//       toast.success("Farmers data loaded successfully!");
//     } catch (err) {
//       toast.error("Failed to fetch from API, using cached data.");
//     } finally {
//       setRefreshing(false);
//     }
//   };
//   initializeData();
// }, [fetchCropsByIds, BASE_URL]);

//   // Convert farmersData object to array and filter
//   useEffect(() => {
//     const farmersArray = Object.values(farmersData); // ✅ object -> array
//     const filtered = farmersArray.filter((farmer) => {
//       const matchesSearch =
//         farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.district.toLowerCase().includes(searchTerm.toLowerCase());
//       return matchesSearch;
//     });
//     setFilteredFarmers(filtered);
//   }, [searchTerm, farmersData]);

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await fetchCropsByIds(BASE_URL);
//       toast.success("Data refreshed successfully!");
//     } catch (err) {
//       toast.error("Failed to refresh data.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading farmers...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Farmers Directory
//         </h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <X className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={handleRefresh}
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
//         <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>

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
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw
//               className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* ✅ Only farmers who have crops */}
//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }














// "use client";
// import { useState, useEffect } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, RefreshCw } from "lucide-react";
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { toast } from "sonner";

// import { useCropStore } from "@/stores/cropStore"; // ✅ yaha se lena hai
// import { useUserDataStore } from "@/stores/userDataStore";


// export default function FarmersPage() {
//   const {
//     farmers,
//     crops,
//     fetchAllFarmers,
//     shouldRefresh,
//     loading,
//     error,
//   } = useCropStore(); // ✅ switch to cropStore

//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredFarmers, setFilteredFarmers] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { token } = useUserDataStore(); // ✅ get token from zustand store

//   // Fetch farmers on mount
//   useEffect(() => {
//     const initializeData = async () => {
//       if (shouldRefresh()) {
//         try {
//           setRefreshing(true);
//           await fetchAllFarmers(token, BASE_URL);
//           toast.success("Farmers data loaded successfully!");
//         } catch (err) {
//           toast.error("Failed to fetch farmers.");
//         } finally {
//           setRefreshing(false);
//         }
//       }
//     };

//     initializeData();
//   }, [fetchAllFarmers, shouldRefresh, BASE_URL, token]);

//   // Filter farmers based on search term
//   useEffect(() => {
    
//     const filtered = farmers.filter((farmer) => {
//       const matchesSearch =
//         farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.district.toLowerCase().includes(searchTerm.toLowerCase());
//       return matchesSearch;
//     });
//     setFilteredFarmers(filtered);
//   }, [searchTerm, farmers]);

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await fetchAllFarmers(token, BASE_URL);
//       toast.success("Data refreshed successfully!");
//     } catch (err) {
//       toast.error("Failed to refresh data.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading farmers...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Farmers Directory
//         </h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <X className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={handleRefresh}
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
//         <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>

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
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw
//               className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`}
//             />
//             Refresh
//           </button>
//         </div>
//       </div>

//       {/* ✅ Now pulls farmers & crops from farmerStore */}
//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }















// "use client";
// import { useState, useEffect } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, RefreshCw } from "lucide-react";
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { toast } from "sonner";
// import { useCropStore } from "@/stores/cropStore";

// export default function FarmersPage() {
//   const { crops, farmersData, fetchCropsByIds, shouldRefresh, loading, error } = useCropStore();
//   const [farmers, setFarmers] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filteredFarmers, setFilteredFarmers] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);

//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

//   // Fetch data from cropStore
//   useEffect(() => {
//     const initializeData = async () => {
//       if (shouldRefresh()) {
//         try {
//           setRefreshing(true);
//           await fetchCropsByIds(BASE_URL);
//           toast.success("Data loaded successfully!");
//         } catch (err) {
//           toast.error("Failed to fetch data.");
//         } finally {
//           setRefreshing(false);
//         }
//       }
//     };

//     initializeData();
//   }, [fetchCropsByIds, shouldRefresh, BASE_URL]);

//   // Update farmers list when store data changes
//   useEffect(() => {
//     setFarmers(Object.values(farmersData));
//   }, [farmersData]);

//   // Filter farmers based on search term
//   useEffect(() => {
//     const filtered = farmers.filter((farmer) => {
//       const matchesSearch =
//         farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         farmer.district.toLowerCase().includes(searchTerm.toLowerCase());
//       return matchesSearch;
//     });
//     setFilteredFarmers(filtered);
//   }, [searchTerm, farmers]);

//   const handleRefresh = async () => {
//     try {
//       setRefreshing(true);
//       await fetchCropsByIds(BASE_URL);
//       toast.success("Data refreshed successfully!");
//     } catch (err) {
//       toast.error("Failed to refresh data.");
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading farmers...</p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Farmers Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="flex-shrink-0">
//               <X className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={handleRefresh}
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
//         <h1 className="text-3xl font-bold text-gray-900">Farmers Directory</h1>

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
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? "animate-spin" : ""}`} />
//             Refresh
//           </button>
//         </div>
//       </div>

//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }