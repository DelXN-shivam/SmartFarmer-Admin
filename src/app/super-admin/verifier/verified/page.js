"use client"

import VerifierCard from "@/components/ui/VerifierCard";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from '@/components/ui/badge';
import { FileText} from "lucide-react";


export default function VerifiedVerifiers() {
    const [verifiers, setVerifiers] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const token = typeof window !== "undefined"
        ? localStorage.getItem('Authorization')?.split(' ')[1]
        : null;

    const fetchVerifiedVerifiers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/api/verifier/unverified?flag=true`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const verified = res.data?.verifiers || [];
        setVerifiers(verified);

        if (verified.length === 0) {
          toast.info("No verified verifiers found");
        }
      } catch (err) {
        console.error("Error fetching verified verifiers:", err);
        toast.error("Failed to fetch verifiers");
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteVerifier = async (verifierId) => {
      try {
        const res = await axios.delete(
          `${BASE_URL}/api/verifier/delete/${verifierId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.status === 200) {
          toast.success("Verifier deleted successfully");
          // Refresh the list after deletion
          await fetchVerifiedVerifiers();
        }
      } catch (err) {
        console.error("Error deleting verifier:", err);
        toast.error("Failed to delete verifier");
      }
    };

    useEffect(() => {
      fetchVerifiedVerifiers();
    }, []);

    if (loading) {
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Verified Verifiers
          </h1>
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200 w-26 h-8"
          >
            <FileText className="w-8 h-8 mr-1" />
            Count : {verifiers.length}
          </Badge>
          <button
            onClick={() => router.push("/taluka-officer/verifier/all")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {verifiers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No verified verifiers found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {verifiers.map((verifier) => (
              <VerifierCard
                key={verifier._id}
                verifier={verifier}
                onDelete={() => {
                  handleDeleteVerifier(verifier._id);
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
}