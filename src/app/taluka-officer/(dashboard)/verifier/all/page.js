"use client";

import { useEffect, useState } from "react";
import VerifierCard from "@/components/ui/VerifierCard";
import { X, XCircle, RefreshCw } from "lucide-react";
import GoToTopButton from "@/components/ui/GoToTopButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useVerifierStore } from "@/stores/verifierStore";
import { useAuth } from "@/context/AuthContext";

export default function VerifiersPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { user } = useAuth();

  const {
    verifiers,
    loading,
    error,
    fetchAllVerifiers,
    fetchVerifiersByIds,
    updateVerifier,
    shouldRefresh,
  } = useVerifierStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [filteredVerifiers, setFilteredVerifiers] = useState([]);

  // Function to initialize data
  const initializeData = async (forceRefresh = false) => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/login");
        return;
      }

      if (forceRefresh || shouldRefresh() || verifiers.length === 0) {
        await fetchVerifiersByIds(BASE_URL);
        toast.success("Data refreshed successfully!");
      }
    } catch (err) {
      console.error("Error initializing data:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("Authorization");
        toast.error("Session expired. Redirecting to login...");
        router.push("/login");
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, [BASE_URL, router, fetchAllVerifiers, shouldRefresh, verifiers.length]);

  // Filter verifiers based on taluka, search, and status
  useEffect(() => {
    if (user?.taluka && verifiers.length > 0) {
      const filtered = verifiers.filter((verifier) => {
        if (!verifier || typeof verifier !== "object") return false;
        
        const matchesTaluka = verifier.taluka === user.taluka;
        const searchLower = searchTerm.toLowerCase();
        const name = verifier.name || "";
        const village = verifier.village || "";
        const district = verifier.district || "";
        const taluka = verifier.taluka || "";

        const matchesSearch = name.toLowerCase().includes(searchLower) ||
          village.toLowerCase().includes(searchLower) ||
          district.toLowerCase().includes(searchLower) ||
          taluka.toLowerCase().includes(searchLower);
        
        const matchesStatus = statusFilter === "all" || 
          verifier.applicationStatus === statusFilter;

        return matchesTaluka && matchesSearch && matchesStatus;
      });
      setFilteredVerifiers(filtered);
    } else {
      // If no taluka filter or no user taluka, use regular filtering
      const filtered = verifiers.filter((verifier) => {
        if (!verifier || typeof verifier !== "object") return false;
        const searchLower = searchTerm.toLowerCase();
        const name = verifier.name || "";
        const village = verifier.village || "";
        const district = verifier.district || "";
        const taluka = verifier.taluka || "";

        const matchesSearch = name.toLowerCase().includes(searchLower) ||
          village.toLowerCase().includes(searchLower) ||
          district.toLowerCase().includes(searchLower) ||
          taluka.toLowerCase().includes(searchLower);
        
        const matchesStatus = statusFilter === "all" || 
          verifier.applicationStatus === statusFilter;

        return matchesSearch && matchesStatus;
      });
      setFilteredVerifiers(filtered);
    }
  }, [verifiers, user?.taluka, searchTerm, statusFilter]);

  const handleVerifyVerifier = async (verifierToVerify) => {
    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error("Authentication required");
        return router.push("/login");
      }
      const response = await fetch(
        `${BASE_URL}/api/verifier/${verifierToVerify._id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        updateVerifier(verifierToVerify._id, { isVerified: true });
        toast.success(`Verified ${verifierToVerify.name} successfully!`);
      } else {
        throw new Error("Verification failed");
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
      const response = await fetch(
        `${BASE_URL}/api/verifier/update/${updatedVerifier._id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedVerifier),
        }
      );

      if (response.ok) {
        const data = await response.json();
        updateVerifier(updatedVerifier._id, data.data);
        toast.success("Verifier updated successfully!");
      } else {
        throw new Error("Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(
        `Update failed: ${err.response?.data?.message || "Server error"}`
      );
    }
  };

  if (loading && verifiers.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading verifiers...</p>
      </div>
    );
  }

  if (error && verifiers.length === 0) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Verifier Directory
        </h1>
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
          {user?.taluka ? `${user.taluka} Verifier Directory` : "Verifier Directory"}
        </h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Search by name, village, district or taluka..."
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
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <VerifierCard
        verifiers={filteredVerifiers}
        onVerify={handleVerifyVerifier}
        onEdit={handleEditVerifier}
        category={"Verifier"}
        isTalukasAllocated={true}
      />

      <GoToTopButton />
    </div>
  );
}















// "use client";

// import { useEffect, useState } from "react";
// import VerifierCard from "@/components/ui/VerifierCard";
// import { X, XCircle, RefreshCw } from "lucide-react";
// import GoToTopButton from "@/components/ui/GoToTopButton";
// import { useRouter } from "next/navigation";
// import { toast } from "sonner";
// import { Input } from "@/components/ui/input";
// import { useVerifierStore } from "@/stores/verifierStore";
// import { useAuth } from "@/context/AuthContext";

// export default function VerifiersPage() {
//   const router = useRouter();
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { user } = useAuth();

//   const {
//     verifiers,
//     loading,
//     error,
//     fetchAllVerifiers,
//     updateVerifier,
//     shouldRefresh,
//   } = useVerifierStore();

//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState("all");
//   const [refreshing, setRefreshing] = useState(false);
//   const [filteredVerifiers, setFilteredVerifiers] = useState([]);

//   // Function to initialize data
//   const initializeData = async (forceRefresh = false) => {
//     try {
//       setRefreshing(true);
//       const token = localStorage.getItem("Authorization")?.split(" ")[1];
//       if (!token) {
//         toast.error("Session expired. Please login again.");
//         router.push("/login");
//         return;
//       }

//       if (forceRefresh || shouldRefresh() || verifiers.length === 0) {
//         await fetchAllVerifiers(token, BASE_URL);
//         toast.success("Data refreshed successfully!");
//       }
//     } catch (err) {
//       console.error("Error initializing data:", err);
//       if (err.response?.status === 401) {
//         localStorage.removeItem("Authorization");
//         toast.error("Session expired. Redirecting to login...");
//         router.push("/login");
//       }
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   useEffect(() => {
//     initializeData();
//   }, [BASE_URL, router, fetchAllVerifiers, shouldRefresh, verifiers.length]);

//   // Filter verifiers based on taluka, search, and status
//   useEffect(() => {
//     if (user?.taluka && verifiers.length > 0) {
//       const filtered = verifiers.filter((verifier) => {
//         if (!verifier || typeof verifier !== "object") return false;
        
//         const matchesTaluka = verifier.taluka === user.taluka;
//         const searchLower = searchTerm.toLowerCase();
//         const name = verifier.name || "";
//         const village = verifier.village || "";
//         const district = verifier.district || "";
//         const taluka = verifier.taluka || "";

//         const matchesSearch = name.toLowerCase().includes(searchLower) ||
//           village.toLowerCase().includes(searchLower) ||
//           district.toLowerCase().includes(searchLower) ||
//           taluka.toLowerCase().includes(searchLower);
        
//         const matchesStatus = statusFilter === "all" || 
//           verifier.applicationStatus === statusFilter;

//         return matchesTaluka && matchesSearch && matchesStatus;
//       });
//       setFilteredVerifiers(filtered);
//     } else {
//       // If no taluka filter or no user taluka, use regular filtering
//       const filtered = verifiers.filter((verifier) => {
//         if (!verifier || typeof verifier !== "object") return false;
//         const searchLower = searchTerm.toLowerCase();
//         const name = verifier.name || "";
//         const village = verifier.village || "";
//         const district = verifier.district || "";
//         const taluka = verifier.taluka || "";

//         const matchesSearch = name.toLowerCase().includes(searchLower) ||
//           village.toLowerCase().includes(searchLower) ||
//           district.toLowerCase().includes(searchLower) ||
//           taluka.toLowerCase().includes(searchLower);
        
//         const matchesStatus = statusFilter === "all" || 
//           verifier.applicationStatus === statusFilter;

//         return matchesSearch && matchesStatus;
//       });
//       setFilteredVerifiers(filtered);
//     }
//   }, [verifiers, user?.taluka, searchTerm, statusFilter]);

//   const handleVerifyVerifier = async (verifierToVerify) => {
//     try {
//       const token = localStorage.getItem("Authorization")?.split(" ")[1];
//       if (!token) {
//         toast.error("Authentication required");
//         return router.push("/login");
//       }
//       const response = await fetch(
//         `${BASE_URL}/api/verifier/${verifierToVerify._id}/verify`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       if (response.ok) {
//         updateVerifier(verifierToVerify._id, { isVerified: true });
//         toast.success(`Verified ${verifierToVerify.name} successfully!`);
//       } else {
//         throw new Error("Verification failed");
//       }
//     } catch (err) {
//       console.error("Verification failed:", err);
//       toast.error(
//         `Failed to verify ${verifierToVerify.name}: ${
//           err.response?.data?.message || "Server error"
//         }`
//       );
//     }
//   };

//   const handleEditVerifier = async (updatedVerifier) => {
//     try {
//       const token = localStorage.getItem("Authorization")?.split(" ")[1];
//       if (!token) {
//         toast.error("Authentication required");
//         return router.push("/login");
//       }
//       const response = await fetch(
//         `${BASE_URL}/api/verifier/update/${updatedVerifier._id}`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(updatedVerifier),
//         }
//       );

//       if (response.ok) {
//         const data = await response.json();
//         updateVerifier(updatedVerifier._id, data.data);
//         toast.success("Verifier updated successfully!");
//       } else {
//         throw new Error("Update failed");
//       }
//     } catch (err) {
//       console.error("Update failed:", err);
//       toast.error(
//         `Update failed: ${err.response?.data?.message || "Server error"}`
//       );
//     }
//   };

//   if (loading && verifiers.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading verifiers...</p>
//       </div>
//     );
//   }

//   if (error && verifiers.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">
//           Verifier Directory
//         </h1>
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
//           {user?.taluka ? `${user.taluka} Verifier Directory` : "Verifier Directory"}
//         </h1>

//         <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
//           <div className="relative flex-grow">
//             <Input
//               type="text"
//               placeholder="Search by name, village, district or taluka..."
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

//       <VerifierCard
//         verifiers={filteredVerifiers}
//         onVerify={handleVerifyVerifier}
//         onEdit={handleEditVerifier}
//         category={"Verifier"}
//         isTalukasAllocated={true}
//       />

//       <GoToTopButton />
//     </div>
//   );
// }