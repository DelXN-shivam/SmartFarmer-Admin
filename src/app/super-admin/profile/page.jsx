"use client";
import React from "react";
import { useUserDataStore } from "@/stores/userDataStore";

export default function ProfilePage() {
  const { user, role, token } = useUserDataStore();

  if (!token) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-6 mt-10 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            />
          </svg>
        </div>
        <p className="text-red-500 font-semibold text-lg">Not logged in</p>
        <p className="text-gray-600 mt-2">Please log in to view your profile</p>
      </div>
    );
  }

  // Group profile information into logical sections
  const personalInfo = [
    { label: "Name", value: user?.name || "N/A" },
    { label: "Email", value: user?.email || "N/A" },
    { label: "Phone", value: user?.phone || "N/A" },
    { label: "Age", value: user?.age || "N/A" },
    { label: "Aadhaar Number", value: user?.aadhaarNumber || "N/A" },
  ];

  const addressInfo = [
    { label: "Village", value: user?.village || "N/A" },
    { label: "Landmark", value: user?.landMark || "N/A" },
    { label: "Taluka", value: user?.taluka || "N/A" },
    { label: "District", value: user?.district || "N/A" },
    { label: "State", value: user?.state || "N/A" },
    { label: "Pincode", value: user?.pincode || "N/A" },
  ];

  const accountInfo = [
    { label: "Role", value: role || "N/A" },
    { label: "User ID", value: user?._id?.slice(-8) || "N/A" },
    {
      label: "Created At",
      value: user?.createdAt
        ? new Date(user.createdAt).toLocaleString()
        : "N/A",
    },
  ];

  return (
    <div className="w-full mx-auto bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b">
        <div className="flex items-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
          </div>
          <div className="ml-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {user?.name || "User Profile"}
            </h1>
            <p className="text-gray-600 mt-1">{role || "User"}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information Card */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Personal Information
            </h2>
            <div className="space-y-3">
              {personalInfo.map((item, index) => (
                <div key={index} className="flex">
                  <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                    {item.label}:
                  </span>
                  <span className="text-gray-600">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Address Information Card */}
          <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Address
            </h2>
            <div className="space-y-3">
              {addressInfo.map((item, index) => (
                <div key={index} className="flex">
                  <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                    {item.label}:
                  </span>
                  <span className="text-gray-600">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-100 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Account Information
          </h2>
          <div className="space-y-3">
            {accountInfo.map((item, index) => (
              <div key={index} className="flex">
                <span className="font-medium text-gray-700 w-32 flex-shrink-0">
                  {item.label}:
                </span>
                <span className="text-gray-600">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Token Information */}
        {/* <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-100">
          <p className="font-semibold text-blue-800 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
              />
            </svg>
            Authentication Token (first 50 characters)
          </p>
          <div className="mt-2 p-3 bg-white rounded text-xs text-gray-600 break-all font-mono border">
            {token?.slice(0, 50)}...
          </div>
        </div> */}
      </div>
    </div>
  );
}
