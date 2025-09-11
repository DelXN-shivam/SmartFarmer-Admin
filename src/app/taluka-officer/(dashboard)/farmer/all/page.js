// app/farmer/page.js
"use client";
import { useEffect, useState } from "react";
import FarmerCard from "@/components/ui/FarmerCard";
import { X, XCircle } from 'lucide-react';
import GoToTopButton from "@/components/ui/GoToTopButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useFarmerStore } from "@/stores/farmerStore";

export default function FarmersPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  
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

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = localStorage.getItem("Authorization")?.split(" ")[1];
        if (!token) {
          toast.error('Authentication token not found. Redirecting...');
          router.push('/login');
          return;
        }

        // Fetch data only if needed
        if (shouldRefresh() || farmers.length === 0) {
          await fetchAllFarmers(token, BASE_URL);
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("Authorization");
          toast.error('Authentication failed please login again');
          router.push('/login');
        }
      }
    };

    initializeData();
  }, [BASE_URL, router, fetchAllFarmers, shouldRefresh, farmers.length]);

  const filteredFarmers = farmers.filter(farmer => {
    const matchesSearch = farmer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.village?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      farmer.district?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" ||
      farmer.applicationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
                onClick={() => {
                  const token = localStorage.getItem("Authorization")?.split(" ")[1];
                  if (token) fetchAllFarmers(token, BASE_URL);
                }}
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
        </div>
      </div>

      <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

      <GoToTopButton />
    </div>
  );
}



// "use client";
// import axios from "axios";
// import { useEffect, useState } from "react";
// import FarmerCard from "@/components/ui/FarmerCard";
// import { X, XCircle } from 'lucide-react';
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";

// export default function FarmersPage() {
//   const [loading, setLoading] = useState(true);
//   const [farmers, setFarmers] = useState([]);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [crops, setCrops] = useState([]);
//   const [cropIds, setCropIds] = useState([])
//   const router = useRouter();
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

//   const getAllFarmers = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem("Authorization")?.split(" ")[1];
//       if (!token) {
//         toast.error('Authentication token not found. Redirecting...');
//         router.push('//login');
//         return;
//       }

//       const res = await axios.get(`${BASE_URL}/api/farmer`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });

//       if (res.status === 200) {
//         setFarmers(res.data.data);
//         const allCropIds = res.data.data.flatMap(farmer => farmer.crops);
//         setCropIds(allCropIds);

//       }
//     } catch (err) {
//       console.error("Error fetching farmers:", err);
//       setError(err.response?.data?.message || err.message || "Failed to fetch farmers");

//       // Handle unauthorized access
//       if (err.response?.status === 401) {
//         toast.error('Authentication fialed please login again');
//         localStorage.removeItem("Authorization");
//         router.push('//login');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getAllCrops = async () => {
//     try {
//       const res = await axios.post(`${BASE_URL}/api/crop/get-by-ids`,
//         { ids: cropIds }
//       )

//       if (res.status = 200) {
//         setCrops(res.data.crops);
//       }
//     } catch (err) {
//       console.log("error", err);
//       toast.error(err.message);
//     }
//   }
//   useEffect(() => {
//     getAllFarmers();
//   }, []);

//   useEffect(() => {
//     if (cropIds.length > 0) {
//       getAllCrops();
//     }
//   }, [cropIds]);

//   const filteredFarmers = farmers.filter(farmer => {
//     const matchesSearch = farmer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       farmer.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       farmer.district.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesStatus = statusFilter === "all" ||
//       farmer.applicationStatus === statusFilter;

//     return matchesSearch && matchesStatus;
//   });

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
//               <XCircle className="h-5 w-5 text-red-500" />
//             </div>
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={getAllFarmers}
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
//         </div>
//       </div>

//       <FarmerCard farmers={filteredFarmers} type={"Farmer"} crops={crops} />

//       <GoToTopButton />
//     </div>
//   );
// }