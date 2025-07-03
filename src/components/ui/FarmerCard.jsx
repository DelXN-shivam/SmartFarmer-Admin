import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock, User, Navigation } from 'lucide-react';

const FarmerProfileCard = () => {
  const farmerData = {
    location: {
      latitude: 20.0056,
      longitude: 74.5623
    },
    _id: "6864d069747683ec0675f6ef",
    name: "Suresh Patil",
    email: "suresh.patil@example.com",
    contact: "9123456789",
    aadhaarNumber: "987654321098",
    village: "Bhavanipur",
    landMark: "Opposite Primary School",
    taluka: "Chandwad",
    district: "Jalgaon",
    pincode: "425001",
    password: "$2a$10$xxpCXCOfpVuryft.dlKdAu38mVeyc5tYJEdDRnYfDOTt.hpK93I02",
    isVerified: false,
    submittedDocuments: [
      "aadhaar_back.jpg",
      "soil_test_report.pdf"
    ],
    applicationStatus: "pending",
    crops: []
  };

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
    return aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3');
  };

  const formatDocumentName = (doc) => {
    return doc.replace(/[_-]/g, ' ').replace(/\.(jpg|pdf|png)$/i, '').toUpperCase();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{farmerData.name}</CardTitle>
              <p className="text-sm text-gray-600">ID: {farmerData._id.slice(-8)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(farmerData.applicationStatus)} flex items-center space-x-1`}>
              {getStatusIcon(farmerData.applicationStatus)}
              <span className="capitalize">{farmerData.applicationStatus}</span>
            </Badge>
            <Badge variant={farmerData.isVerified ? "default" : "secondary"} className="flex items-center space-x-1">
              {farmerData.isVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>{farmerData.isVerified ? 'Verified' : 'Unverified'}</span>
            </Badge>
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
                <span className="text-gray-700">{farmerData.contact}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{farmerData.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">Aadhaar: {maskAadhaar(farmerData.aadhaarNumber)}</span>
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
                  <p className="font-medium">{farmerData.village}</p>
                  <p className="text-sm text-gray-600">{farmerData.landMark}</p>
                  <p className="text-sm">{farmerData.taluka}, {farmerData.district}</p>
                  <p className="text-sm">PIN: {farmerData.pincode}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Navigation className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">
                  {farmerData.location.latitude.toFixed(4)}, {farmerData.location.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Submitted Documents</h3>
          <div className="flex flex-wrap gap-2">
            {farmerData.submittedDocuments.map((doc, index) => (
              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <FileText className="w-3 h-3 mr-1" />
                {formatDocumentName(doc)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Crops Section */}
        <div className="mt-6 pt-4 border-t">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Crops Information</h3>
          {farmerData.crops.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {farmerData.crops.map((crop, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {crop}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No crops information available</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FarmerProfileCard;