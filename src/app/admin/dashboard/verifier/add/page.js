"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, Mail, FileText, User, Navigation, Lock, Plus, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const AddVerifierPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contact: '',
    aadhaarNumber: '',
    age: '',
    village: '',
    landMark: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    password: '',
    confirmPassword: '',
    location: {
      latitude: '',
      longitude: ''
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const router = useRouter();
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'latitude' || name === 'longitude') {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [name]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact is required';
    if (!formData.aadhaarNumber.trim()) newErrors.aadhaarNumber = 'Aadhaar number is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.taluka.trim()) newErrors.taluka = 'Taluka is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Pincode is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Confirm password is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone validation
    if (formData.contact && !/^\d{10}$/.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid 10-digit phone number';
    }

    // Aadhaar validation
    if (formData.aadhaarNumber && !/^\d{12}$/.test(formData.aadhaarNumber)) {
      newErrors.aadhaarNumber = 'Please enter a valid 12-digit Aadhaar number';
    }

    // Age validation
    if (formData.age && (isNaN(formData.age) || formData.age < 18 || formData.age > 100)) {
      newErrors.age = 'Please enter a valid age (18-100)';
    }

    // Pincode validation
    if (formData.pincode && !/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }

    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("Authorization")?.split(" ")[1];
      if (!token) {
        toast.error('Authentication token not found, redirecting to login');
        setTimeout(async() => {
          await router.push('/admin/login');
        }, 3000);
        return; // Add this return to stop further execution
      }

      // Prepare data for submission (exclude confirmPassword)
      const { confirmPassword, ...submitData } = formData;

      const response = await axios.post(
        `${BASE_URL}/api/verifier/add`,
        submitData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.status === 201) {
        toast.success('Verifier registered successfully!', {
          duration: 4000,
          position: 'top-center',
        });
        setSubmitSuccess(true);

        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          contact: '',
          aadhaarNumber: '',
          age: '',
          village: '',
          landMark: '',
          taluka: '',
          district: '',
          state: '',
          pincode: '',
          password: '',
          confirmPassword: '',
          location: {
            latitude: '',
            longitude: ''
          }
        });
      }

    } catch (err) {
      if (err.response?.status === 401) {
        toast.error('Authentication Failed, redirecting to login page');
        localStorage.removeItem('Authorization');
        setTimeout(() => {
          router.push('/admin/login');
        }, 3000);
        return; // Add this return to stop further execution
      }

      if (err.response?.status === 500) {
        const errorMessage = err.response?.data?.message || '';

        if (errorMessage.includes('contact_1')) {
          setErrors(prev => ({
            ...prev,
            contact: 'This phone number is already registered'
          }));
          toast.error('This phone number is already registered');
        }
        else if (errorMessage.includes('aadhaarNumber_1')) {
          setErrors(prev => ({
            ...prev,
            aadhaarNumber: 'This Aadhaar number is already registered'
          }));
          toast.error('This Aadhaar number is already registered');
        }
        else {
          toast.error('An error occurred while registering the verifier');
        }
      }
      else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="w-full shadow-lg">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifier Added Successfully!</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add New Verifier</h1>
        <p className="text-gray-600 mt-2">Fill in the details to register a new verifier</p>
      </div>

      <Card className="w-full shadow-lg">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b px-3 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <CardTitle className="text-xl font-bold text-gray-900">Verifier Registration Form</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="100"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.age ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter age"
                  />
                  {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.contact ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aadhaar Number *
                  </label>
                  <input
                    type="text"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.aadhaarNumber ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter 12-digit Aadhaar number"
                  />
                  {errors.aadhaarNumber && <p className="text-red-500 text-sm mt-1">{errors.aadhaarNumber}</p>}
                </div>
              </div>

              {/* Address Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Address Details</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Village *
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.village ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter village name"
                  />
                  {errors.village && <p className="text-red-500 text-sm mt-1">{errors.village}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landMark"
                    value={formData.landMark}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter nearby landmark"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Taluka *
                    </label>
                    <input
                      type="text"
                      name="taluka"
                      value={formData.taluka}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.taluka ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter taluka"
                    />
                    {errors.taluka && <p className="text-red-500 text-sm mt-1">{errors.taluka}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      District *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.district ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter district"
                    />
                    {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.state ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter state"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pincode *
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.pincode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      placeholder="Enter pincode"
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Location Coordinates */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Location Coordinates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.location.latitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter latitude"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.location.longitude}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Enter longitude"
                  />
                </div>
              </div>
            </div>

            {/* Password Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Security Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Enter password"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Adding Verifier...</span>
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4" />
                    <span>Add Verifier</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddVerifierPage;