"use client"

import { useState } from "react"
import { X, Calendar, MapPin, Package, Ruler, Sprout, User, ShieldCheck, Mail, Phone, Map, IdCard, Award, CheckCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const CropCard = ({ crops, farmersData = {}, verifiersData = {} }) => {
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedVerifier, setSelectedVerifier] = useState(null);

  const openCropDetails = (crop) => setSelectedCrop(crop);
  const closeCropDetails = () => setSelectedCrop(null);

  // Handler for View Farmer button
  const handleViewFarmer = (crop, e) => {
    e.stopPropagation(); // Prevent opening crop details

    // Use pre-fetched farmer data if available
    if (crop.farmerId && farmersData[crop.farmerId]) {
      const farmer = farmersData[crop.farmerId];
      const farmerData = {
        id: farmer._id,
        name: farmer.name,
        email: farmer.email || "N/A",
        phone: farmer.contact,
        address: `${farmer.village || ""}, ${farmer.taluka || ""}, ${
          farmer.district || ""
        }, ${farmer.state || ""} - ${farmer.pincode || ""}`,
        registrationDate: farmer.createdAt,
        totalCrops: farmer.crops?.length || 0,
        verifiedCrops: farmer.crops?.length || 0, // Adjust based on your logic
        status: farmer.applicationStatus || "active",
      };
      setSelectedFarmer(farmerData);
    } else {
      // Fallback to mock data if not available
      const farmerData = {
        id: crop.farmerId || "FARM-001",
        name: "Rajesh Kumar",
        email: "rajesh.kumar@example.com",
        phone: "+91 9876543210",
        address: "123 Green Fields, Agricultural Zone, Maharashtra",
        registrationDate: "2023-05-15",
        totalCrops: 12,
        verifiedCrops: 8,
        status: "active",
      };
      setSelectedFarmer(farmerData);
    }
  };

  // Handler for View Verifier button
  const handleViewVerifier = (crop, e) => {
    e.stopPropagation(); // Prevent opening crop details

    if (!crop.verifierId) return;

    // Use pre-fetched verifier data if available
    if (verifiersData[crop.verifierId]) {
      const verifier = verifiersData[crop.verifierId];
      const verifierData = {
        id: verifier._id,
        name: verifier.name,
        email: verifier.email,
        phone: verifier.contact,
        specialization: "Organic Farming & Certification", // Adjust based on your data
        verificationCount: verifier.cropId?.length || 0,
        successRate: "98%", // Adjust based on your logic
        joinDate: verifier.createdAt,
        status: "verified",
      };
      setSelectedVerifier(verifierData);
    } else {
      // Fallback to mock data if not available
      const verifierData = {
        id: crop.verifierId || "VER-005",
        name: "Dr. Priya Sharma",
        email: "priya.sharma@agri-verify.org",
        phone: "+91 9123456789",
        specialization: "Organic Farming & Certification",
        verificationCount: 142,
        successRate: "98%",
        joinDate: "2022-01-10",
        status: "verified",
      };
      setSelectedVerifier(verifierData);
    }
  };

  const closeFarmerDetails = () => setSelectedFarmer(null);
  const closeVerifierDetails = () => setSelectedVerifier(null);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "active":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Farmer Detail Overlay Component
  const FarmerDetailOverlay = ({ farmer, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-blue-800 to-blue-900 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{farmer.name}</h2>
                  <p className="text-white/90 text-sm">
                    Farmer ID: {farmer.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Close details"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <IdCard className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Email Address
                    </Label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      <p className="font-semibold text-gray-900">
                        {farmer.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Phone Number
                    </Label>
                    <div className="flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2 text-blue-600" />
                      <p className="font-semibold text-gray-900">
                        {farmer.phone}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Registration Date
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {formatDate(farmer.registrationDate)}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className="font-semibold text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          farmer.status
                        )}`}
                      >
                        {farmer.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Farm Statistics */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Farm Statistics
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Total Crops Registered
                    </Label>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {farmer.totalCrops}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Verified Crops
                    </Label>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {farmer.verifiedCrops}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Verification Rate
                    </Label>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {Math.round(
                        (farmer.verifiedCrops / farmer.totalCrops) * 100
                      )}
                      %
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Map className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Address</h3>
              </div>
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                <p className="text-gray-900">{farmer.address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Verifier Detail Overlay Component
  const VerifierDetailOverlay = ({ verifier, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-800 to-purple-900 p-6">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <ShieldCheck className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{verifier.name}</h2>
                  <p className="text-white/90 text-sm">
                    Verifier ID: {verifier.id}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Close details"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <IdCard className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Personal Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Email Address
                    </Label>
                    <div className="flex items-center mt-1">
                      <Mail className="w-4 h-4 mr-2 text-purple-600" />
                      <p className="font-semibold text-gray-900">
                        {verifier.email}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Phone Number
                    </Label>
                    <div className="flex items-center mt-1">
                      <Phone className="w-4 h-4 mr-2 text-purple-600" />
                      <p className="font-semibold text-gray-900">
                        {verifier.phone}
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Join Date</Label>
                    <p className="font-semibold text-gray-900">
                      {formatDate(verifier.joinDate)}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className="font-semibold text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          verifier.status
                        )}`}
                      >
                        {verifier.status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Statistics */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Verification Stats
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Total Verifications
                    </Label>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {verifier.verificationCount}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Success Rate
                    </Label>
                    <p className="font-semibold text-gray-900 text-2xl">
                      {verifier.successRate}
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Specialization
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {verifier.specialization}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="mt-6 bg-green-50 rounded-xl p-6 border border-green-200">
              <div className="flex items-center justify-center">
                <div className="bg-white rounded-full p-4 shadow-md">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    Certified Verifier
                  </h3>
                  <p className="text-gray-600 mt-1">
                    This verifier has been certified by the Agricultural
                    Verification Board and meets all quality standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Crop Detail Overlay Component (unchanged from previous implementation)
  const CropDetailOverlay = ({ crop, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div
            className={`relative p-6 ${
              crop.applicationStatus === "verified"
                ? "bg-gradient-to-r from-green-800 to-green-900"
                : crop.applicationStatus === "pending"
                ? "bg-gradient-to-r from-yellow-700 to-yellow-800"
                : "bg-gradient-to-r from-red-700 to-red-900"
            }`}
          >
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                  <Sprout className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">{crop.name}</h2>
                  <p className="text-white/90 text-sm">
                    Crop ID: {crop._id?.slice(-8)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-full transition-all duration-200 backdrop-blur-sm"
                aria-label="Close details"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          {/* Content */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Crop Information Card */}
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Sprout className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Crop Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Crop Name</Label>
                    <p className="font-semibold text-gray-900">
                      {crop.name || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Previous Crop
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {crop.previousCrop || "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Sowing Date</Label>
                    <p className="font-semibold text-gray-900">
                      {crop.sowingDate ? formatDate(crop.sowingDate) : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Status</Label>
                    <p className="font-semibold text-gray-900">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          crop.applicationStatus
                        )}`}
                      >
                        {crop.applicationStatus}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Harvest Information Card */}
              <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Harvest Details
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Expected First Harvest
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {crop.expectedFirstHarvestDate
                        ? formatDate(crop.expectedFirstHarvestDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Expected Last Harvest
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {crop.expectedLastHarvestDate
                        ? formatDate(crop.expectedLastHarvestDate)
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">
                      Expected Yield
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {crop.expectedYield?.value || "N/A"}{" "}
                      {crop.expectedYield?.unit || ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Area Information Card */}
            <div className="mt-6 bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Ruler className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Area Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <Label className="text-sm text-gray-500">Area</Label>
                  <p className="font-semibold text-gray-900">
                    {crop.area?.value || "N/A"} {crop.area?.unit || ""}
                  </p>
                </div>
                <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                  <Label className="text-sm text-gray-500">
                    Location Coordinates
                  </Label>
                  <p className="font-semibold text-gray-900">
                    {crop.latitude?.toFixed(6) || "N/A"},{" "}
                    {crop.longitude?.toFixed(6) || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Farmer and Verifier Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Farmer Information Card */}
              <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Farmer Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Farmer ID</Label>
                    <p className="font-semibold text-gray-900">
                      {crop.farmerId || "N/A"}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() =>
                      handleViewFarmer(crop, { stopPropagation: () => {} })
                    }
                  >
                    <User className="w-4 h-4 mr-2" />
                    View Farmer Details
                  </Button>
                </div>
              </div>

              {/* Verifier Information Card */}
              <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Verifier Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
                    <Label className="text-sm text-gray-500">Verifier ID</Label>
                    <p className="font-semibold text-gray-900">
                      {crop.verifierId || "Not assigned"}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    disabled={!crop.verifierId}
                    onClick={() =>
                      crop.verifierId &&
                      handleViewVerifier(crop, { stopPropagation: () => {} })
                    }
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    View Verifier Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Images Section */}
            {crop.images && crop.images.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Crop Images
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {crop.images.map((image, index) => (
                    <div
                      key={index}
                      className="rounded-lg overflow-hidden shadow-md"
                    >
                      <img
                        src={image}
                        alt={`Crop image ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!crops || crops.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Sprout className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No crops found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <p className="text-gray-600 mb-6">
        Showing {crops.length} crop{crops.length !== 1 ? "s" : ""}
      </p>
      {/* Grid of Crop Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {crops.map((crop) => (
          <Card
            key={crop._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border border-green-100 overflow-hidden"
            onClick={() => openCropDetails(crop)}
          >
            <CardContent className="p-0">
              {/* Image Section */}
              {crop.images && crop.images.length > 0 && (
                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={crop.images[0]}
                    alt={crop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Content Section */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900 truncate">
                    {crop.name}
                  </h3>
                  <Badge
                    className={`ml-2 ${getStatusBadgeClass(
                      crop.applicationStatus
                    )}`}
                  >
                    {crop.applicationStatus}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Ruler className="w-4 h-4 mr-2 text-green-600" />
                    <span>
                      {crop.area?.value} {crop.area?.unit}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="w-4 h-4 mr-2 text-amber-600" />
                    <span>
                      Yield: {crop.expectedYield?.value}{" "}
                      {crop.expectedYield?.unit}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    <span>
                      Sown:{" "}
                      {crop.sowingDate ? formatDate(crop.sowingDate) : "N/A"}
                    </span>
                  </div>

                  {crop.latitude && crop.longitude && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2 text-red-600" />
                      <span>Location tracked</span>
                    </div>
                  )}
                </div>

                {/* Buttons Section */}
                <div className="mt-4 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full border-green-300 text-green-700 hover:bg-green-50"
                  >
                    View Details
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50 h-9"
                      onClick={(e) => handleViewFarmer(crop, e)}
                    >
                      <User className="w-3 h-3 mr-1" />
                      Farmer
                    </Button>

                    <Button
                      variant="outline"
                      className="text-xs border-purple-300 text-purple-700 hover:bg-purple-50 h-9"
                      onClick={(e) => handleViewVerifier(crop, e)}
                      disabled={!crop.verifierId}
                    >
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      Verifier
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overlay Modals */}
      {selectedCrop && (
        <CropDetailOverlay crop={selectedCrop} onClose={closeCropDetails} />
      )}

      {selectedFarmer && (
        <FarmerDetailOverlay
          farmer={selectedFarmer}
          onClose={closeFarmerDetails}
        />
      )}

      {selectedVerifier && (
        <VerifierDetailOverlay
          verifier={selectedVerifier}
          onClose={closeVerifierDetails}
        />
      )}
    </div>
  );
};

export default CropCard;
