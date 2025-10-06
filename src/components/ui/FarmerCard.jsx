// import React, { useState } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock, User, Navigation, Eye, EyeOff, X } from 'lucide-react';

// const FarmerCard = ({ farmers, type }) => {
//   const [selectedFarmer, setSelectedFarmer] = useState(null);

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
//       case 'approved': return 'bg-green-100 text-green-800 border-green-300';
//       case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
//       default: return 'bg-gray-100 text-gray-800 border-gray-300';
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'pending': return <Clock className="w-4 h-4" />;
//       case 'approved': return <CheckCircle className="w-4 h-4" />;
//       case 'rejected': return <XCircle className="w-4 h-4" />;
//       default: return <Clock className="w-4 h-4" />;
//     }
//   };

//   const maskAadhaar = (aadhaar) => {
//     return aadhaar?.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3') || 'Not provided';
//   };

//   const formatDocumentName = (doc) => {
//     return doc.replace(/[_-]/g, ' ').replace(/\.(jpg|pdf|png)$/i, '').toUpperCase();
//   };

//   const openFarmerDetails = (farmer) => {
//     setSelectedFarmer(farmer);
//   };

//   const closeFarmerDetails = () => {
//     setSelectedFarmer(null);
//   };

//   const FarmerDetailOverlay = ({ farmer, onClose }) => (
//     <div className="fixed inset-0 bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-4 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
//           <h2 className="text-2xl font-bold text-gray-900">{type == 'Farmer' ? 'Farmer' : "Verifier"} Details</h2>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
//             aria-label="Close details"
//           >
//             <X className="w-6 h-6 text-gray-500" />
//           </button>
//         </div>

//         <div className="p-6">
//           <Card className="w-full shadow-none border-0">
//             <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b px-3 py-3">
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center space-x-3">
//                   <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
//                     <User className="w-6 h-6 text-green-600 mt-2" />
//                   </div>
//                   <div>
//                     <CardTitle className="text-xl font-bold text-gray-900">{farmer.name}</CardTitle>
//                     <p className="text-sm text-gray-600">ID: {farmer._id?.slice(-8)}</p>
//                   </div>
//                 </div>
//               </div>
//             </CardHeader>

//             <CardContent className="p-6">
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Contact Information */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Details</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-center space-x-3">
//                       <Phone className="w-4 h-4 text-blue-600" />
//                       <span className="text-gray-700">{farmer.contact}</span>
//                     </div>
//                     {farmer.email && (
//                       <div className="flex items-center space-x-3">
//                         <Mail className="w-4 h-4 text-blue-600" />
//                         <span className="text-gray-700">{farmer.email}</span>
//                       </div>
//                     )}
//                     <div className="flex items-center space-x-3">
//                       <FileText className="w-4 h-4 text-blue-600" />
//                       <span className="text-gray-700">Aadhaar: {maskAadhaar(farmer.aadhaarNumber)}</span>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Address Information */}
//                 <div className="space-y-4">
//                   <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Details</h3>
//                   <div className="space-y-3">
//                     <div className="flex items-start space-x-3">
//                       <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
//                       <div className="text-gray-700">
//                         <p className="font-medium">Village : {farmer.village}</p>
//                         {farmer.landMark && <p className="text-sm text-gray-600">Land Mark : {farmer.landMark}</p>}
//                         <p className="text-sm">Taluka : {farmer.taluka} </p>
//                         <p className="text-sm">District : {farmer.district}</p>
//                         <p className="text-sm">PIN: {farmer.pincode}</p>
//                       </div>
//                     </div>
//                     {farmer.location && (
//                       <div className="flex items-center space-x-3">
//                         <Navigation className="w-4 h-4 text-green-600" />
//                         <span className="text-sm text-gray-600">
//                           {farmer.location.latitude?.toFixed(4)}, {farmer.location.longitude?.toFixed(4)}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Documents Section */}
//               {farmer.submittedDocuments && farmer.submittedDocuments.length > 0 && (
//                 <div className="mt-6 pt-4 border-t">
//                   <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Documents</h3>
//                   <div className="flex flex-wrap gap-2">
//                     {farmer.submittedDocuments.map((doc, index) => (
//                       <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
//                         <FileText className="w-3 h-3 mr-1" />
//                         {formatDocumentName(doc)}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Crops Section */}
//               {type == 'Farmer' ? <div className="mt-6 pt-4 border-t">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-3">Crops Information</h3>
//                 {farmer.crops && farmer.crops.length > 0 ? (
//                   <div className="flex flex-wrap gap-2">
//                     {farmer.crops.map((crop, index) => (
//                       <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
//                         {crop}
//                       </Badge>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 text-sm">No crops information available</p>
//                 )}
//               </div> : <div></div>}
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );

//   if (!farmers || farmers.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center py-12">
//         <User className="w-16 h-16 text-gray-400 mb-4" />
//         <p className="text-gray-500 text-lg">No farmers found.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-4xl mx-auto p-4">
//       <p className="text-gray-600 mb-4">
//         Showing {farmers.length} {(type == 'Farmer' ? 'Farmer' : "Verifier")}{farmers.length !== 1 ? 's' : ''}
//       </p>

//       <div className="space-y-4">
//         {farmers.map((farmer) => (
//           <div key={farmer._id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
//             <div className="flex items-center justify-between p-4">
//               <div className="flex items-center space-x-4">
//                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
//                   <User className="w-5 h-5 text-green-600" />
//                 </div>
//                 <div>
//                   <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
//                   <p className="text-sm text-gray-600">District : {farmer.district} • Village : {farmer.village}</p>
//                 </div>
//               </div>

//               <button
//                 onClick={() => openFarmerDetails(farmer)}
//                 className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
//                 aria-label="View details"
//               >
//                 <Eye className="w-5 h-5" />
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Overlay Modal */}
//       {selectedFarmer && (
//         <FarmerDetailOverlay
//           farmer={selectedFarmer}
//           onClose={closeFarmerDetails}
//         />
//       )}
//     </div>
//   );
// };

// export default FarmerCard;

//----------------------------------------- Small Card -------------------------------------------


"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock, User, Navigation, Eye, X } from "lucide-react"

const FarmerCard = ({ farmers, type, crops }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(null)
  const [isTableView, setIsTableView] = useState(true)
  const [filters, setFilters] = useState({
    name: "",
    village: "",
    taluka: "",
    district: "",
    pincode: "",
    contact: "",
    crops: "",
    status: "",
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "approved":
        return "bg-green-100 text-green-800 border-green-300"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCropNames = (ids) => {
    return ids
      .map(id => crops.find(crop => crop._id === id)?.name)
      .filter(Boolean) // Remove undefineds
      .join(', ');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "approved":
        return <CheckCircle className="w-4 h-4" />
      case "rejected":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const maskAadhaar = (aadhaar) => {
    return aadhaar?.replace(/(\d{4})(\d{4})(\d{4})/, "****-****-$3") || "Not provided"
  }

  const formatDocumentName = (doc) => {
    return doc
      .replace(/[_-]/g, " ")
      .replace(/\.(jpg|pdf|png)$/i, "")
      .toUpperCase()
  }

  const openFarmerDetails = (farmer) => {
    setSelectedFarmer(farmer)
  }

  const closeFarmerDetails = () => {
    setSelectedFarmer(null)
  }

  const includesIgnoreCase = (value, query) => {
    if (!query) return true
    if (value === undefined || value === null) return false
    return String(value).toLowerCase().includes(String(query).toLowerCase())
  }

  const filteredFarmers = useMemo(() => {
    const list = Array.isArray(farmers) ? farmers : []
    return list.filter((farmer) => {
      const cropNames = getCropNames(farmer?.crops || [])
      return (
        includesIgnoreCase(farmer?.name, filters.name) &&
        includesIgnoreCase(farmer?.village, filters.village) &&
        includesIgnoreCase(farmer?.taluka, filters.taluka) &&
        includesIgnoreCase(farmer?.district, filters.district) &&
        includesIgnoreCase(farmer?.pincode, filters.pincode) &&
        includesIgnoreCase(farmer?.contact, filters.contact) &&
        includesIgnoreCase(cropNames, filters.crops) &&
        includesIgnoreCase(farmer?.applicationStatus, filters.status)
      )
    })
  }, [farmers, filters, crops])

  const FarmerDetailOverlay = ({ farmer, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="relative bg-gradient-to-r from-green-500 via-blue-500 to-purple-600 p-6">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold">{farmer.name}</h2>
                <p className="text-white/90 text-sm">
                  {type === "Farmer" ? "Farmer" : "Verifier"} • ID: {farmer._id?.slice(-8)}
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

        {/* Enhanced Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Contact Information Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Contact Information</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-semibold text-gray-900">{farmer.contact}</p>
                  </div>
                </div>
                {farmer.email && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold text-gray-900">{farmer.email}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-500">Aadhaar Number</p>
                    <p className="font-semibold text-gray-900">{maskAadhaar(farmer.aadhaarNumber)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Address Details</h3>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm text-gray-500">Village</p>
                      <p className="font-semibold text-gray-900">{farmer.village}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Taluka</p>
                      <p className="font-semibold text-gray-900">{farmer.taluka}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">District</p>
                      <p className="font-semibold text-gray-900">{farmer.district}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">PIN Code</p>
                      <p className="font-semibold text-gray-900">{farmer.pincode}</p>
                    </div>
                  </div>
                  {farmer.landMark && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Landmark</p>
                      <p className="font-semibold text-gray-900">{farmer.landMark}</p>
                    </div>
                  )}
                </div>
                {farmer.location && (
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <Navigation className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-500">GPS Coordinates</p>
                      <p className="font-semibold text-gray-900">
                        {farmer.location.latitude?.toFixed(4)}, {farmer.location.longitude?.toFixed(4)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          {farmer.submittedDocuments && farmer.submittedDocuments.length > 0 && (
            <div className="mt-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Submitted Documents</h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {farmer.submittedDocuments.map((doc, index) => (
                  <div
                    key={index}
                    className="bg-white p-3 rounded-lg shadow-sm border border-purple-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900 truncate">{formatDocumentName(doc)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Crops Section */}
          {type === "Farmer" && (
            <div className="mt-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">🌾</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Crops Information</h3>
              </div>
              <p className="mt-2 text-sm">
                <span className="font-medium">Crops:</span>{" "}
                {getCropNames(farmer.crops) || "NA"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  if (!farmers || farmers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No farmers found.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Showing {filteredFarmers.length} {type == "Farmer" ? "Farmer" : "Verifier"}
          {filteredFarmers.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button className="border rounded px-3 py-1 text-sm" onClick={() => setIsTableView((v) => !v)}>
            {isTableView ? "Card View" : "Table View"}
          </button>
        </div>
      </div>

      {isTableView ? (
        <div className="w-full overflow-x-auto rounded-lg border">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Village</th>
                <th className="px-3 py-2">Taluka</th>
                <th className="px-3 py-2">District</th>
                <th className="px-3 py-2">PIN</th>
                <th className="px-3 py-2">Phone</th>
                <th className="px-3 py-2">Crops</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
              <tr className="border-t text-xs">
                <th className="px-3 py-2"><input value={filters.name} onChange={(e) => setFilters({ ...filters, name: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.village} onChange={(e) => setFilters({ ...filters, village: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.taluka} onChange={(e) => setFilters({ ...filters, taluka: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.pincode} onChange={(e) => setFilters({ ...filters, pincode: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.contact} onChange={(e) => setFilters({ ...filters, contact: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.crops} onChange={(e) => setFilters({ ...filters, crops: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2"><input value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} placeholder="Search" className="w-full border rounded px-2 py-1" /></th>
                <th className="px-3 py-2">
                  <button className="w-full border rounded px-2 py-1" onClick={() => setFilters({ name: "", village: "", taluka: "", district: "", pincode: "", contact: "", crops: "", status: "" })}>Clear</button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFarmers.map((farmer) => (
                <tr key={farmer._id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium">{farmer.name || "-"}</td>
                  <td className="px-3 py-2">{farmer.village || "-"}</td>
                  <td className="px-3 py-2">{farmer.taluka || "-"}</td>
                  <td className="px-3 py-2">{farmer.district || "-"}</td>
                  <td className="px-3 py-2">{farmer.pincode || "-"}</td>
                  <td className="px-3 py-2">{farmer.contact || "-"}</td>
                  <td className="px-3 py-2">{getCropNames(farmer.crops || []) || "NA"}</td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(farmer.applicationStatus)}`}>{farmer.applicationStatus || "-"}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button className="border rounded px-2 py-1 text-xs" onClick={() => openFarmerDetails(farmer)}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredFarmers.map((farmer) => (
          <Card
            key={farmer._id}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 bg-white border border-gray-200"
            onClick={() => openFarmerDetails(farmer)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col items-center text-center space-y-2">
                {/* Avatar */}
                <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>

                {/* Name */}
                <div>
                  <h3 className="font-medium text-gray-900 text-sm truncate w-full" title={farmer.name}>
                    {farmer.name}
                  </h3>
                </div>

                {/* Location Info */}
                <div className="space-y-1 w-full">
                  <div className="flex items-center justify-center space-x-1 text-xs text-gray-600">
                    <MapPin className="w-2.5 h-2.5" />
                    <span className="truncate" title={farmer.village}>
                      {farmer.village}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate" title={farmer.taluka}>
                    {farmer.taluka}
                  </p>
                </div>

                {/* View Details Button */}
                <div className="pt-1">
                  <div className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800">
                    <Eye className="w-2.5 h-2.5" />
                    <span className="text-xs">Details</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}

      {/* Overlay Modal */}
      {selectedFarmer && <FarmerDetailOverlay farmer={selectedFarmer} onClose={closeFarmerDetails} />}
    </div>
  )
}

export default FarmerCard
