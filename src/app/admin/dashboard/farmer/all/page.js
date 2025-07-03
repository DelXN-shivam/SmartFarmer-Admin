"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText, CheckCircle, XCircle, Clock, User, Navigation } from 'lucide-react';

// Farmer Profile Card Component
const FarmerProfileCard = ({ farmer }) => {
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
    return aadhaar ? aadhaar.replace(/(\d{4})(\d{4})(\d{4})/, '****-****-$3') : 'N/A';
  };

  const formatDocumentName = (doc) => {
    return doc.replace(/[_-]/g, ' ').replace(/\.(jpg|pdf|png)$/i, '').toUpperCase();
  };

  return (
    <Card className="w-full shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">{farmer.name}</CardTitle>
              <p className="text-sm text-gray-600">ID: {farmer._id?.slice(-8)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={`${getStatusColor(farmer.applicationStatus)} flex items-center space-x-1`}>
              {getStatusIcon(farmer.applicationStatus)}
              <span className="capitalize">{farmer.applicationStatus || 'pending'}</span>
            </Badge>
            <Badge variant={farmer.isVerified ? "default" : "secondary"} className="flex items-center space-x-1">
              {farmer.isVerified ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              <span>{farmer.isVerified ? 'Verified' : 'Unverified'}</span>
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
                <span className="text-gray-700">{farmer.contact}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-gray-700">{farmer.email}</span>
              </div>
              {farmer.aadhaarNumber && (
                <div className="flex items-center space-x-3">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Aadhaar: {maskAadhaar(farmer.aadhaarNumber)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Details</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="text-gray-700">
                  <p className="font-medium">{farmer.village}</p>
                  {farmer.landMark && <p className="text-sm text-gray-600">{farmer.landMark}</p>}
                  <p className="text-sm">{farmer.taluka}, {farmer.district}</p>
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
        <div className="mt-6 pt-4 border-t">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default function GetFarmers() {
  const [loading, setLoading] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [error, setError] = useState("");

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const token = typeof window !== "undefined"
    ? localStorage.getItem("Authorization")?.split(" ")[1]
    : null;

  const getAllFarmers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/farmer`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 200) {
        setFarmers(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch farmers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllFarmers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-red-600 p-4">{error}</p>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Farmers Directory</h1>
      
      {farmers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <User className="w-16 h-16 text-gray-400 mb-4" />
          <p className="text-gray-500 text-lg">No farmers found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Showing {farmers.length} farmer{farmers.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {farmers.map((farmer) => (
              <FarmerProfileCard key={farmer._id} farmer={farmer} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}