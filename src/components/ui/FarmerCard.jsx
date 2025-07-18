import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock, User, Navigation, Eye, EyeOff, X } from 'lucide-react';

const FarmerCard = ({ farmers, type }) => {
  const [selectedFarmer, setSelectedFarmer] = useState(null);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'approved': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const maskAadhaar = (aadhaar) => {
    return aadhaar?.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3') || 'Not provided';
  };

  const formatDocumentName = (doc) => {
    return doc.replace(/[_-]/g, ' ').replace(/\.(jpg|pdf|png)$/i, '').toUpperCase();
  };

  const openFarmerDetails = (farmer) => {
    setSelectedFarmer(farmer);
  };

  const closeFarmerDetails = () => {
    setSelectedFarmer(null);
  };

  const FarmerDetailOverlay = ({ farmer, onClose }) => (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-lg shadow-lg rounded-2xl p-4 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{type == 'Farmer' ? 'Farmer' : "Verifier"} Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
            aria-label="Close details"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          <Card className="w-full shadow-none border-0">
            <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b px-3 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-green-600 mt-2" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-900">{farmer.name}</CardTitle>
                    <p className="text-sm text-gray-600">ID: {farmer._id?.slice(-8)}</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Contact Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">{farmer.contact}</span>
                    </div>
                    {farmer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-700">{farmer.email}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-gray-700">Aadhaar: {maskAadhaar(farmer.aadhaarNumber)}</span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                      <div className="text-gray-700">
                        <p className="font-medium">Village : {farmer.village}</p>
                        {farmer.landMark && <p className="text-sm text-gray-600">Land Mark : {farmer.landMark}</p>}
                        <p className="text-sm">Taluka : {farmer.taluka} </p>
                        <p className="text-sm">District : {farmer.district}</p>
                        <p className="text-sm">PIN: {farmer.pincode}</p>
                      </div>
                    </div>
                    {farmer.location && (
                      <div className="flex items-center space-x-3">
                        <Navigation className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-600">
                          {farmer.location.latitude?.toFixed(4)}, {farmer.location.longitude?.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              {farmer.submittedDocuments && farmer.submittedDocuments.length > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Documents</h3>
                  <div className="flex flex-wrap gap-2">
                    {farmer.submittedDocuments.map((doc, index) => (
                      <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <FileText className="w-3 h-3 mr-1" />
                        {formatDocumentName(doc)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Crops Section */}
              {type == 'Farmer' ? <div className="mt-6 pt-4 border-t">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Crops Information</h3>
                {farmer.crops && farmer.crops.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {farmer.crops.map((crop, index) => (
                      <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        {crop}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No crops information available</p>
                )}
              </div> : <div></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  if (!farmers || farmers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <User className="w-16 h-16 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No farmers found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <p className="text-gray-600 mb-4">
        Showing {farmers.length} {(type == 'Farmer' ? 'Farmer' : "Verifier")}{farmers.length !== 1 ? 's' : ''}
      </p>

      <div className="space-y-4">
        {farmers.map((farmer) => (
          <div key={farmer._id} className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                  <p className="text-sm text-gray-600">District : {farmer.district} • Village : {farmer.village}</p>
                </div>
              </div>

              <button
                onClick={() => openFarmerDetails(farmer)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="View details"
              >
                <Eye className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Overlay Modal */}
      {selectedFarmer && (
        <FarmerDetailOverlay
          farmer={selectedFarmer}
          onClose={closeFarmerDetails}
        />
      )}
    </div>
  );
};

export default FarmerCard;