"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import FarmerCard from "@/components/ui/FarmerCard";
import { X } from 'lucide-react';
import GoToTopButton from "@/components/ui/GoToTopButton";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function VerifiersPage() {
  const [loading, setLoading] = useState(true);
  const [verifier, setVerifiers] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const getAllVerifiers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error('Authentication token not found . Redirecting ...')
        router.push('/admin/login')
      }

      const res = await axios.get(`${BASE_URL}/api/verifier`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 200) {
        setVerifiers(res.data.data);
        
      }

      
    } catch (err) {
      console.error("Error fetching verifier:", err);
      setError(err.response?.data?.message || err.message || "Failed to fetch verifier");

      if(err.response?.status == 401){
        toast.error('Authentication Failed , redirecting to login page');
        localStorage.removeItem('Authorization');
        setTimeout(() => {
          router.push('/admin/login')
        } , 3000)
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllVerifiers();
  }, []);

  const filteredVerifier = verifier.filter(verifier => {
    // Apply search filter
    const matchesSearch = verifier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verifier.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      verifier.district.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === "all" ||
      verifier.applicationStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-gray-600">Loading Verifiers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Verifier Directory</h1>
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={getAllVerifiers}
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
      <div className="flex flex-col md:flex-row justify-between items-sDirectart md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Verifier Directory</h1>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search by name, village or district..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

      <FarmerCard farmers={filteredVerifier} type = {"Verifier"} />

      <GoToTopButton />
    </div>
  );
}