"use client";
import React from "react";
import { useUserDataStore } from "@/stores/userDataStore";

export default function ProfilePage() {
  const { user, role, token } = useUserDataStore();

  if (!token) {
    return (
      <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
        <p className="text-red-500 font-semibold">Not logged in</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>

      <div className="space-y-3 text-gray-700">
        <p>
          <span className="font-semibold">Name:</span> {user?.name || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Email:</span> {user?.email || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Phone:</span> {user?.contact || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Role:</span> {role || "N/A"}
        </p>
        <p>
          <span className="font-semibold">User ID:</span>{" "}
          {user?._id?.slice(-8) || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Created At:</span>{" "}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleString()
            : "N/A"}
        </p>

        {/* ✅ Extra fields */}
        <p>
          <span className="font-semibold">Aadhaar Number:</span>{" "}
          {user?.aadhaarNumber || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Age:</span> {user?.age || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Village:</span> {user?.village || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Landmark:</span> {user?.landMark || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Taluka:</span> {user?.taluka || "N/A"}
        </p>
        <p>
          <span className="font-semibold">District:</span> {user?.district || "N/A"}
        </p>
        <p>
          <span className="font-semibold">State:</span> {user?.state || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Pincode:</span> {user?.pincode || "N/A"}
        </p>
      </div>

      <div className="mt-6 bg-gray-50 p-3 rounded text-xs text-gray-500 break-all">
        <p className="font-semibold">Token (first 50 chars):</p>
        <p>{token?.slice(0, 50)}...</p>
      </div>
    </div>
  );
}











// "use client";
// import React from "react";
// import { useUserDataStore } from "@/stores/userDataStore";

// export default function ProfilePage() {
//   const { user, role, token } = useUserDataStore();

//   if (!token) {
//     return (
//       <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
//         <p className="text-red-500 font-semibold">Not logged in</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6 mt-10">
//       <h1 className="text-2xl font-bold mb-4">Profile</h1>

//       <div className="space-y-3 text-gray-700">
//         <p>
//           <span className="font-semibold">Name:</span> {user?.name || "N/A"}
//         </p>
//         <p>
//           <span className="font-semibold">Email:</span> {user?.email || "N/A"}
//         </p>
//         <p>
//           <span className="font-semibold">Phone:</span> {user?.contact || "N/A"}
//         </p>
//         <p>
//           <span className="font-semibold">Role:</span> {role || "N/A"}
//         </p>
//         <p>
//           <span className="font-semibold">User ID:</span> {user?._id.slice(-8) || "N/A"}
//         </p>
//         <p>
//           <span className="font-semibold">Created At:</span>{" "}
//           {user?.createdAt
//             ? new Date(user.createdAt).toLocaleString()
//             : "N/A"}
//         </p>
//       </div>

//       <div className="mt-6 bg-gray-50 p-3 rounded text-xs text-gray-500 break-all">
//         <p className="font-semibold">Token (first 50 chars):</p>
//         <p>{token?.slice(0, 50)}...</p>
//       </div>
//     </div>
//   );
// }
