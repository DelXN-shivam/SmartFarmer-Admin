"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useUserDataStore } from "@/stores/userDataStore";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { login } = useAuth();
  const router = useRouter();

  // Zustand store
  const setUserData = useUserDataStore((state) => state.setUserData);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check for existing authentication and redirect if valid
  useEffect(() => {
    const checkExistingAuth = () => {
      try {
        const token = localStorage.getItem("Authorization");
        const role = localStorage.getItem("Role");
        const rememberMeStatus = localStorage.getItem("rememberMe") === "true";

        // Only redirect if we have a valid token, role, and remember me is enabled
        if (token && role && rememberMeStatus) {
          // Verify token is valid (you might want to add a proper token validation check here)
          if (token.startsWith("Bearer ")) {
            redirectBasedOnRole(role);
          } else {
            setIsCheckingAuth(false);
          }
        } else {
          setIsCheckingAuth(false);
        }
      } catch (err) {
        console.error("Error checking existing auth:", err);
        setIsCheckingAuth(false);
      }
    };

    checkExistingAuth();
  }, [router]);

  // Load saved credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("Email");
    const savedRememberMe = localStorage.getItem("rememberMe") === "true";

    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
    setRememberMe(savedRememberMe);
  }, []);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case "talukaOfficer":
        router.push("/taluka-officer");
        break;
      case "superAdmin":
        router.push("/super-admin");
        break;
      case "districtOfficer":
        router.push("/district-officer");
        break;
      case "admin":
        router.push("/admin-dashboard");
        break;
      case "farmer":
        router.push("/farmer/dashboard");
        break;
      default:
        router.push("/");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!formData.email || !formData.password) {
        setError("Please fill in all fields");
        setLoading(false);
        return;
      }

      const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
        withCredentials: true,
      });

      const data = res.data;
      console.log("Login response:", data);

      if (res.status === 200 && data.token) {
        // Save email if "Remember me" is checked
        if (rememberMe) {
          localStorage.setItem("Email", formData.email);
          localStorage.setItem("Role", data.role || data.data?.role);
          localStorage.setItem("Authorization", `Bearer ${data.token}`);
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("Email");
          localStorage.removeItem("Role");
          localStorage.removeItem("Authorization");
          localStorage.setItem("rememberMe", "false");
        }

        // Save user in Zustand store
        setUserData(data);

        // Redirect based on role
        const userRole = data.role || data.data?.role;
        // Save to context
        login({ role: userRole, token: data.token, email: formData.email });

        redirectBasedOnRole(userRole);
      } else {
        setError("Invalid credentials or server error");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || "Login failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the admin panel
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 block text-sm text-gray-700">
                  Remember me
                </span>
              </div>

              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
                loading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useRouter } from 'next/navigation';
// import { useUserDataStore } from '@/stores/userDataStore';

// export default function LoginPage() {
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const router = useRouter();

//   // Zustand store
//   const setUserData = useUserDataStore((state) => state.setUserData);

//   const [formData, setFormData] = useState({
//     email: '',
//     password: ''
//   });
//   const [rememberMe, setRememberMe] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   // Load saved credentials on component mount
//   useEffect(() => {
//     const savedEmail = localStorage.getItem('Email');
//     const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

//     if (savedEmail) {
//       setFormData((prev) => ({ ...prev, email: savedEmail }));
//     }
//     setRememberMe(savedRememberMe);
//   }, []);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//     if (error) setError('');
//   };

//   const handleRememberMeChange = (e) => {
//     setRememberMe(e.target.checked);
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();

//     try {
//       setLoading(true);
//       setError('');

//       if (!formData.email || !formData.password) {
//         setError('Please fill in all fields');
//         setLoading(false);
//         return;
//       }

//       const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
//         withCredentials: true,
//       });

//       const data = res.data;
//       console.log('Login response:', data);

//       if (res.status === 200 && data.token) {
//         // Save email if "Remember me" is checked
//         if (rememberMe) {
//           localStorage.setItem('Email', formData.email);
//           localStorage.setItem("Role", data.role);
//           localStorage.setItem('Authorization', `Bearer ${data.token}`);
//           localStorage.setItem('rememberMe', 'true');
//         } else {
//           localStorage.removeItem('Email');
//           localStorage.setItem('rememberMe', 'false');
//         }

//         // Save user in Zustand store
//         setUserData(data);

//         // Redirect based on role
//         switch (data.data?.role) {
//           case 'talukaOfficer':
//             router.push('/taluka-officer');
//             break;
//           case 'superAdmin':
//             router.push('/super-admin');
//             break;
//           case 'districtOfficer':
//             router.push('/district-officer');
//             break;
//           case 'admin':
//             router.push('/admin-dashboard');
//             break;
//           case 'farmer':
//             router.push('/farmer/dashboard');
//             break;
//           default:
//             router.push('/');
//         }
//       } else {
//         setError('Invalid credentials or server error');
//       }
//     } catch (err) {
//       console.error('Login error:', err);
//       setError(err.response?.data?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleSubmit();
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-md w-full space-y-8">
//         <div className="bg-white rounded-lg shadow-md p-8">
//           <div className="text-center mb-8">
//             <h2 className="text-3xl font-bold text-gray-900">Login</h2>
//             <p className="mt-2 text-sm text-gray-600">
//               Sign in to access the admin panel
//             </p>
//           </div>

//           {error && (
//             <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
//               <p>{error}</p>
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email Address
//               </label>
//               <input
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 onKeyPress={handleKeyPress}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="admin@example.com"
//                 required
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <input
//                 name="password"
//                 type="password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 onKeyPress={handleKeyPress}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 placeholder="••••••••"
//                 required
//               />
//             </div>

//             <div className="flex items-center justify-between">
//               <div className="flex items-center">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={handleRememberMeChange}
//                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
//                 />
//                 <span className="ml-2 block text-sm text-gray-700">
//                   Remember me
//                 </span>
//               </div>

//               <button
//                 type="button"
//                 className="text-sm text-blue-600 hover:text-blue-500"
//               >
//                 Forgot password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
//                 loading ? 'opacity-70 cursor-not-allowed' : ''
//               }`}
//             >
//               {loading ? 'Signing in...' : 'Sign In'}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }
