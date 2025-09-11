"use client";

import { useEffect, useState } from "react";
import VerifierCard from "@/components/ui/VerifierCard";
import { X, XCircle } from "lucide-react";
import GoToTopButton from "@/components/ui/GoToTopButton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { useVerifierStore } from "@/stores/verifierStore";

export default function VerifiersPage() {
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const {
    verifiers,
    loading,
    error,
    fetchAllVerifiers,
    updateVerifier,
    shouldRefresh,
  } = useVerifierStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const initializeData = async () => {
      try {
        const token = localStorage.getItem("Authorization")?.split(" ")[1];
        if (!token) {
          toast.error("Session expired. Please login again.");
          router.push("/login");
          return;
        }

        if (shouldRefresh() || verifiers.length === 0) {
          await fetchAllVerifiers(token, BASE_URL);
        }
      } catch (err) {
        console.error("Error initializing data:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("Authorization");
          toast.error("Session expired. Redirecting to login...");
          router.push("/login");
        }
      }
    };

    initializeData();
  }, [BASE_URL, router, fetchAllVerifiers, shouldRefresh, verifiers.length]);

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

  const filteredVerifiers = verifiers.filter((verifier) => {
    if (!verifier || typeof verifier !== "object") return false;
    const searchLower = searchTerm.toLowerCase();
    const name = verifier.name || "";
    const village = verifier.village || "";
    const district = verifier.district || "";
    const taluka = verifier.taluka || "";

    return (
      (name.toLowerCase().includes(searchLower) ||
        village.toLowerCase().includes(searchLower) ||
        district.toLowerCase().includes(searchLower) ||
        taluka.toLowerCase().includes(searchLower)) &&
      (statusFilter === "all" || verifier.applicationStatus === statusFilter)
    );
  });

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
                onClick={() => {
                  const token = localStorage.getItem("Authorization")?.split(" ")[1];
                  if (token) fetchAllVerifiers(token, BASE_URL);
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
        <h1 className="text-3xl font-bold text-gray-900">Verifier Directory</h1>

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



// // app/verifier/page.js
// "use client"

// import { useEffect, useState } from "react"
// import { X } from "lucide-react"
// import GoToTopButton from "@/components/ui/GoToTopButton"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"
// import VerifierCard from "@/components/ui/VerifierCard"
// import { Input } from "@/components/ui/input"
// import { useVerifierStore } from "@/stores/verifierStore"
// import Link from "next/link"

// export default function VerifiersPage() {
//   const router = useRouter()
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  
//   const {
//     verifiers,
//     loading,
//     error,
//     fetchAllVerifiers,
//     updateVerifier,
//     shouldRefresh
//   } = useVerifierStore()

//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")

//     useEffect(() => {
//     const initializeData = async () => {
//       try {
//         const token = localStorage.getItem("Authorization")?.split(" ")[1]
//         if (!token) {
//           toast.error("Session expired. Please login again.")
//           router.push("/login");
//           return
//         }

//         // Fetch data only if needed
//         if (shouldRefresh() || verifiers.length === 0) {
//           await fetchAllVerifiers(token, BASE_URL)
//         }
//       } catch (err) {
//         console.error("Error initializing data:", err)
//         if (err.response?.status === 401) {
//           localStorage.removeItem("Authorization")
//           toast.error("Session expired. Redirecting to login...")
//           setTimeout(() => router.push("/login"), 2000)
//         }
//       }
//     }

//     initializeData()
//   }, [BASE_URL, router, fetchAllVerifiers, shouldRefresh, verifiers.length])

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
//           method: 'PUT',
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//         }
//       );
      
//       if (response.ok) {
//         updateVerifier(verifierToVerify._id, { isVerified: true });
//         toast.success(`Verified ${verifierToVerify.name} successfully!`);
//       } else {
//         throw new Error('Verification failed');
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
//           method: 'PATCH',
//           headers: { 
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json"
//           },
//           body: JSON.stringify(updatedVerifier)
//         }
//       );
      
//       if (response.ok) {
//         const data = await response.json();
//         updateVerifier(updatedVerifier._id, data.data);
//         toast.success("Verifier updated successfully!");
//       } else {
//         throw new Error('Update failed');
//       }
//     } catch (err) {
//       console.error("Update failed:", err);
//       toast.error(
//         `Update failed: ${err.response?.data?.message || "Server error"}`
//       );
//     }
//   };

//   // Optimized filtering
//   const filteredVerifiers = verifiers.filter((verifier) => {
//     if (!verifier || typeof verifier !== "object") return false
//     const searchLower = searchTerm.toLowerCase()
//     const name = verifier.name || ""
//     const village = verifier.village || ""
//     const district = verifier.district || ""
//     const taluka = verifier.taluka || ""

//     return (
//       (name.toLowerCase().includes(searchLower) ||
//         village.toLowerCase().includes(searchLower) ||
//         district.toLowerCase().includes(searchLower) ||
//         taluka.toLowerCase().includes(searchLower)) &&
//       (statusFilter === "all" || verifier.applicationStatus === statusFilter)
//     )
//   })

//   if (loading && verifiers.length === 0) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//         <p className="ml-4 text-gray-600">Loading Verifiers...</p>
//       </div>
//     )
//   }

//   if (error && verifiers.length === 0) {
//     return (
//       <div className="p-4 max-w-7xl mx-auto">
//         <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifier Directory</h1>
//         <div className="bg-red-50 border-l-4 border-red-500 p-4">
//           <div className="flex">
//             <div className="ml-3">
//               <p className="text-sm text-red-700">{error}</p>
//               <button
//                 onClick={() => {
//                   const token = localStorage.getItem("Authorization")?.split(" ")[1]
//                   if (token) fetchAllVerifiers(token, BASE_URL)
//                 }}
//                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
//               >
//                 Try again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     )
//   }
  
//   return (
//     <div className="p-4 max-w-7xl mx-auto">
//       {/* Add a button to navigate to add verifier page */}
//       <div className="flex justify-between items-center mb-6">
//         {/* <h1 className="text-3xl font-bold text-gray-900 pl-25">Verifier Directory</h1> */}
//         <h1 className="text-3xl font-bold text-gray-900">Verifier Directory</h1>



//         {/* <Link
//           href="/taluka-officer/verifier/add" // Adjust this path to your add verifier page
//           className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//         >
//           + Add Verifier
//         </Link> */}


//       </div>
      

//       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
//         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
//           {/* Search Input */}
//           <div className="relative w-full sm:w-auto">
//             <Input
//               type="text"
//               placeholder="Search verifiers..."
//               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             {searchTerm && (
//               <button
//                 onClick={() => setSearchTerm("")}
//                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
//                 aria-label="Clear search"
//               >
//                 <X className="h-5 w-5" />
//               </button>
//             )}
//           </div>
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


// // "use client"

// // import axios from "axios"
// // import { useEffect, useState, useCallback } from "react"
// // import { X } from "lucide-react"
// // import GoToTopButton from "@/components/ui/GoToTopButton"
// // import { toast } from "sonner"
// // import { useRouter } from "next/navigation"
// // import VerifierCard from "@/components/ui/VerifierCard"
// // import { Input } from "@/components/ui/input"

// // export default function VerifiersPage() {
// //   const [loading, setLoading] = useState(true)
// //   const [verifiers, setVerifiers] = useState([])
// //   const [error, setError] = useState(null)
// //   const [searchTerm, setSearchTerm] = useState("")
// //   const [statusFilter, setStatusFilter] = useState("all")
  
// //   const router = useRouter()
// //   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

// //   // Memoized fetch function with proper error handling
// //   const getAllVerifiers = useCallback(async () => {
// //     try {
// //       setLoading(true)
// //       setError(null)
// //       const token = localStorage.getItem("Authorization")?.split(" ")[1]
// //       if (!token) {
// //         toast.error("Session expired. Please login again.")
// //         router.push("/login");
// //         return
// //       }
// //       const response = await axios.get(`${BASE_URL}/api/verifier`, {
// //         headers: {
// //           Authorization: `Bearer ${token}`,
// //           "Content-Type": "application/json",
// //         },
// //       })
// //       if (response.status === 200 && response.data?.data) {
// //         setVerifiers(response.data.data)
// //       } else {
// //         throw new Error("Invalid response structure")
// //       }
// //     } catch (err) {
// //       console.error("Error fetching verifiers:", err)
// //       const errorMessage = err.response?.data?.message || err.message || "Failed to fetch verifiers"
// //       setError(errorMessage)
// //       if (err.response?.status === 401) {
// //         localStorage.removeItem("Authorization")
// //         toast.error("Session expired. Redirecting to login...")
// //         setTimeout(() => router.push("/login"), 2000)
// //       }
// //     } finally {
// //       setLoading(false)
// //     }
// //   }, [BASE_URL, router])

// //   useEffect(() => {
// //     getAllVerifiers()
// //   }, [getAllVerifiers])

// //   const handleVerifyVerifier = async (verifierToVerify) => {
// //     try {
// //       const token = localStorage.getItem("Authorization")?.split(" ")[1];
// //       if (!token) {
// //         toast.error("Authentication required");
// //         return router.push("/login");
// //       }
// //       const response = await axios.put(
// //         `${BASE_URL}/api/verifier/${verifierToVerify._id}/verify`,
// //         {},
// //         { headers: { Authorization: `Bearer ${token}` } }
// //       );
// //       if (response.status === 200) {
// //         setVerifiers((prev) =>
// //           prev.map((v) =>
// //             v._id === verifierToVerify._id ? { ...v, isVerified: true } : v
// //           )
// //         );
// //         toast.success(`Verified ${verifierToVerify.name} successfully!`);
// //       }
// //     } catch (err) {
// //       console.error("Verification failed:", err);
// //       toast.error(
// //         `Failed to verify ${verifierToVerify.name}: ${
// //           err.response?.data?.message || "Server error"
// //         }`
// //       );
// //     }
// //   };

// //   const handleEditVerifier = async (updatedVerifier) => {
// //     try {
// //       const token = localStorage.getItem("Authorization")?.split(" ")[1];
// //       if (!token) {
// //         toast.error("Authentication required");
// //         return router.push("/login");
// //       }
// //       const response = await axios.patch(
// //         `${BASE_URL}/api/verifier/update/${updatedVerifier._id}`,
// //         updatedVerifier,
// //         {
// //           headers: { Authorization: `Bearer ${token}` },
// //         }
// //       );
// //       if (response.status === 200) {
// //         setVerifiers((prev) =>
// //           prev.map((v) =>
// //             v._id === updatedVerifier._id ? response.data.data : v
// //           )
// //         );
// //         toast.success("Verifier updated successfully!");
// //         setTimeout(() => {
// //           getAllVerifiers();
// //         }, 1500);
// //       }
// //     } catch (err) {
// //       console.error("Update failed:", err);
// //       toast.error(
// //         `Update failed: ${err.response?.data?.message || "Server error"}`
// //       );
// //     }
// //   };

// //   // Optimized filtering
// //   const filteredVerifiers = verifiers.filter((verifier) => {
// //     if (!verifier || typeof verifier !== "object") return false
// //     const searchLower = searchTerm.toLowerCase()
// //     const name = verifier.name || ""
// //     const village = verifier.village || ""
// //     const district = verifier.district || ""
// //     const taluka = verifier.taluka || "" // Added taluka

// //     return (
// //       (name.toLowerCase().includes(searchLower) ||
// //         village.toLowerCase().includes(searchLower) ||
// //         district.toLowerCase().includes(searchLower) ||
// //         taluka.toLowerCase().includes(searchLower)) && // Included taluka in search
// //       (statusFilter === "all" || verifier.applicationStatus === statusFilter)
// //     )
// //   })

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //         <p className="ml-4 text-gray-600">Loading Verifiers...</p>
// //       </div>
// //     )
// //   }

// //   if (error) {
// //     return (
// //       <div className="p-4 max-w-7xl mx-auto">
// //         <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifier Directory</h1>
// //         <div className="bg-red-50 border-l-4 border-red-500 p-4">
// //           <div className="flex">
// //             <div className="ml-3">
// //               <p className="text-sm text-red-700">{error}</p>
// //               <button
// //                 onClick={getAllVerifiers}
// //                 className="mt-2 text-sm font-medium text-red-700 hover:text-red-600 underline"
// //               >
// //                 Try again
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     )
// //   }

// //   return (
// //     <div className="p-4 max-w-7xl mx-auto">
// //       <div className="flex flex-col md:flex-row justify-center items-start md:items-center mb-8 gap-16">
// //         <h1 className="text-3xl font-bold text-gray-900">Verifier Directory</h1>
// //         <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
// //           {/* Search Input */}
// //           <div className="relative w-full sm:w-auto">
// //             <Input
// //               type="text"
// //               placeholder="Search verifiers..."
// //               className="w-full md:w-80 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //             {searchTerm && (
// //               <button
// //                 onClick={() => setSearchTerm("")}
// //                 className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
// //                 aria-label="Clear search"
// //               >
// //                 <X className="h-5 w-5" />
// //               </button>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //       <VerifierCard
// //         verifiers={filteredVerifiers}
// //         onVerify={handleVerifyVerifier}
// //         onEdit={handleEditVerifier}
// //         category={"Verifier"}
// //         isTalukasAllocated={true}
// //       />
// //       <GoToTopButton />
// //     </div>
// //   );
// // }
