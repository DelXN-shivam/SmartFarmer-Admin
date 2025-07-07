"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from '@/components/ui/badge';

import { AlertCircle  , FileText} from "lucide-react";
import VerifierCard from "@/components/ui/VerifierCard";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UnverifiedVerifiers() {
  const [verifiers, setVerifiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = typeof window !== "undefined"
    ? localStorage.getItem('Authorization')?.split(' ')[1]
    : null;

  const fetchUnverifiedVerifiers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/verifier/unverified?flag=false`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`${BASE_URL}/api/verifier/unverified?flag=false`)
      const unverified = res.data.verifiers || [];
      if (unverified.length === 0) {
        toast.success("No unverified verifiers left. Redirecting...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      } else {
        setVerifiers(unverified);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        toast.success("No unverified verifiers left. Redirecting...");
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1500);
      } else {
        console.error(err);
        setError("Failed to fetch verifiers");
        toast.error("Failed to fetch verifiers");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnverifiedVerifiers();
  }, [BASE_URL, router, token]);

  // Handle verification of a specific verifier
  const handleVerify = async (verifierId) => {
    try {
      const res = await axios.patch(`${BASE_URL}/api/verifier/update/${verifierId}`, {
        isVerified: true,
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.status === 200) {
        toast.success("Verifier verified successfully");

        // Correct way to update and check remaining verifiers
        setVerifiers(prev => {
          const updated = prev.filter(v => v._id !== verifierId);

          if (updated.length === 0) {
            toast.success("All verifiers are now verified!");
            setTimeout(() => {
              router.push("/admin/dashboard");
            }, 1500);
          }

          return updated;
        });
      }
    } catch (err) {
      console.error(err);
      console.log(`http://localhost:1000/api/verifier/update/${verifierId}`)
      toast.error("Failed to verify verifier");
    }
  };


  // Handle deletion of a specific verifier
  const handleDelete = async (verifierId) => {
    try {
      const res = await axios.delete(`${BASE_URL}/api/verifier/delete/${verifierId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        toast.success("Verifier deleted successfully");

        // Remove the deleted verifier from local state
        setVerifiers(prev => prev.filter(v => v._id !== verifierId));

        // Check if there are any remaining verifiers
        const remainingVerifiers = verifiers.filter(v => v._id !== verifierId);
        if (remainingVerifiers.length === 0) {
          toast.success("All verifiers processed. Redirecting...");
          setTimeout(() => {
            router.push("/admin/dashboard");
          }, 1500);
        }
      }
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete verifier");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">UnVerified Verifiers</h1>
        <Badge  variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 w-26 h-8">
          <FileText className="w-8 h-8 mr-1" />
          Count : {verifiers.length}
        </Badge>
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>

      {verifiers.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No unverified verifiers found</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
          {verifiers.map(verifier => (
            <VerifierCard
              key={verifier._id}
              verifier={verifier}
              onDelete={() => { handleDelete(verifier._id) }}
              onVerify={() => { handleVerify(verifier._id) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}