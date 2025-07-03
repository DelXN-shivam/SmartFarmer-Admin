'use client';

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  User,
  Building2
} from "lucide-react";

export default function VerifierCard({ verifier, onDelete, onVerify }) {
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(verifier?.isVerified || false);

  const currentVerifier = verifier || {
    name: "Rajesh Kumar Sharma Singh",
    email: "rajesh.kumar.sharma.singh@verylongdomainname.com",
    contact: "+91 9876543210",
    aadhaarNumber: "1234 5678 9012",
    village: "Shivaji Nagar",
    landMark: "Near City Hospital",
    taluka: "Pune",
    district: "Pune",
    state: "Maharashtra",
    pincode: "411001",
    isVerified: false
  };

  return (
    <Card className="w-full min-w-[280px] h-full flex flex-col 
      max-w-md mx-auto shadow-lg hover:shadow-2xl transition-all duration-300 
      hover:scale-[1.02] bg-gradient-to-br from-white to-gray-50 border-0 ring-1 
      ring-gray-200 hover:ring-blue-200">
      
      <CardHeader className="relative overflow-hidden pb-3">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50 opacity-60"></div>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 mb-1 truncate">
                  {currentVerifier.name}
                </CardTitle>
                <CardDescription className="text-gray-600 flex items-center gap-1 min-w-0">
                  <Mail className="flex-shrink-0 w-4 h-4" />
                  <span className="truncate">{currentVerifier.email}</span>
                </CardDescription>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Phone className="w-4 h-4" />
              Contact
            </div>
            <p className="text-gray-900 font-medium">{currentVerifier.contact}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <CreditCard className="w-4 h-4" />
              Aadhaar
            </div>
            <p className="text-gray-900 font-medium font-mono text-sm">{currentVerifier.aadhaarNumber}</p>
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <MapPin className="w-4 h-4" />
            Address
          </div>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              <p className="text-gray-800">{currentVerifier.village}, {currentVerifier.landMark}</p>
            </div>
            <p className="text-gray-700 ml-6">{currentVerifier.taluka}, {currentVerifier.district}</p>
            <p className="text-gray-700 ml-6 font-medium">{currentVerifier.state} - {currentVerifier.pincode}</p>
          </div>
        </div>
      </CardContent>

      {/* Footer with buttons - Improved spacing */}
      <div className="border-t px-6 py-4">
        <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <div className="text-sm font-medium text-gray-500">Status</div>
              <Badge
                variant={isVerified ? "default" : "destructive"}
                className={`${isVerified
                  ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
                  : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
                  } flex items-center gap-1`}
              >
                {isVerified ? (
                  <CheckCircle className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {isVerified ? "Verified" : "Not Verified"}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-3 justify-end">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="sm:max-w-md">
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-500" />
                    Delete Verifier
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    You are about to delete verifier <strong>{currentVerifier.name}</strong>. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={onDelete}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {!isVerified && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Verify User
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to verify <strong>{currentVerifier.name}</strong>.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={onVerify}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? "Verifying..." : "Verify"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}