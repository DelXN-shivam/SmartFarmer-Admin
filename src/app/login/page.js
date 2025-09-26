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
  const [showPassword, setShowPassword] = useState(false);

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
    const savedRememberMe = localStorage.getItem("rememberMe");

    // Only set rememberMe if it exists in localStorage
    if (savedRememberMe !== null) {
      setRememberMe(savedRememberMe === "true");
    }
    // Otherwise, it will keep the default value (true)

    if (savedEmail) {
      setFormData((prev) => ({ ...prev, email: savedEmail }));
    }
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
        // Extract taluka from response data - based on your API response structure
        const taluka = data.data?.taluka;
        console.log("Extracted taluka:", taluka);
        
        // Save email if "Remember me" is checked
        if (rememberMe) {
          localStorage.setItem("Email", formData.email);
          localStorage.setItem("Role", data.role || data.data?.role);
          localStorage.setItem("Authorization", `Bearer ${data.token}`);
          localStorage.setItem("rememberMe", "true");
          
          // Store taluka if available
          if (taluka) {
            localStorage.setItem("Taluka", taluka);
            console.log("Stored taluka:", taluka);
          }
        } else {
          localStorage.removeItem("Email");
          localStorage.removeItem("Role");
          localStorage.removeItem("Authorization");
          localStorage.removeItem("Taluka");
          localStorage.setItem("rememberMe", "false");
        }

        // Save user in Zustand store
        setUserData(data);

        // Redirect based on role
        const userRole = data.role || data.data?.role;
        
        // Save to context with taluka information
        login({ 
          role: userRole, 
          token: data.token, 
          email: formData.email,
          taluka: taluka 
        });

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
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  onKeyPress={handleKeyPress}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>
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














// "use client";

// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useRouter } from "next/navigation";
// import { useUserDataStore } from "@/stores/userDataStore";
// import { useAuth } from "@/context/AuthContext";

// export default function LoginPage() {
//   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
//   const { login } = useAuth();
//   const router = useRouter();

//   // Zustand store
//   const setUserData = useUserDataStore((state) => state.setUserData);

//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [rememberMe, setRememberMe] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [isCheckingAuth, setIsCheckingAuth] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);

//   // Check for existing authentication and redirect if valid
//   useEffect(() => {
//     const checkExistingAuth = () => {
//       try {
//         const token = localStorage.getItem("Authorization");
//         const role = localStorage.getItem("Role");
//         const rememberMeStatus = localStorage.getItem("rememberMe") === "true";

//         // Only redirect if we have a valid token, role, and remember me is enabled
//         if (token && role && rememberMeStatus) {
//           // Verify token is valid (you might want to add a proper token validation check here)
//           if (token.startsWith("Bearer ")) {
//             redirectBasedOnRole(role);
//           } else {
//             setIsCheckingAuth(false);
//           }
//         } else {
//           setIsCheckingAuth(false);
//         }
//       } catch (err) {
//         console.error("Error checking existing auth:", err);
//         setIsCheckingAuth(false);
//       }
//     };

//     checkExistingAuth();
//   }, [router]);

//   // Load saved credentials on component mount
//   useEffect(() => {
//     const savedEmail = localStorage.getItem("Email");
//     const savedRememberMe = localStorage.getItem("rememberMe");

//     // Only set rememberMe if it exists in localStorage
//     if (savedRememberMe !== null) {
//       setRememberMe(savedRememberMe === "true");
//     }
//     // Otherwise, it will keep the default value (true)

//     if (savedEmail) {
//       setFormData((prev) => ({ ...prev, email: savedEmail }));
//     }
//   }, []);

//   const redirectBasedOnRole = (role) => {
//     switch (role) {
//       case "talukaOfficer":
//         router.push("/taluka-officer");
//         break;
//       case "superAdmin":
//         router.push("/super-admin");
//         break;
//       case "districtOfficer":
//         router.push("/district-officer");
//         break;
//       case "admin":
//         router.push("/admin-dashboard");
//         break;
//       case "farmer":
//         router.push("/farmer/dashboard");
//         break;
//       default:
//         router.push("/");
//     }
//   };

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value,
//     });
//     if (error) setError("");
//   };

//   const handleRememberMeChange = (e) => {
//     setRememberMe(e.target.checked);
//   };

//   const handleSubmit = async (e) => {
//     if (e) e.preventDefault();

//     try {
//       setLoading(true);
//       setError("");

//       if (!formData.email || !formData.password) {
//         setError("Please fill in all fields");
//         setLoading(false);
//         return;
//       }

//       const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
//         withCredentials: true,
//       });

//       const data = res.data;
//       console.log("Login response:", data);

//       if (res.status === 200 && data.token) {
//         // Save email if "Remember me" is checked
//         if (rememberMe) {
//           localStorage.setItem("Email", formData.email);
//           localStorage.setItem("Role", data.role || data.data?.role);
//           localStorage.setItem("Authorization", `Bearer ${data.token}`);
//           localStorage.setItem("rememberMe", "true");
//         } else {
//           localStorage.removeItem("Email");
//           localStorage.removeItem("Role");
//           localStorage.removeItem("Authorization");
//           localStorage.setItem("rememberMe", "false");
//         }

//         // Save user in Zustand store
//         setUserData(data);

//         // Redirect based on role
//         const userRole = data.role || data.data?.role;
//         // Save to context
//         login({ role: userRole, token: data.token, email: formData.email });

//         redirectBasedOnRole(userRole);
//       } else {
//         setError("Invalid credentials or server error");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       setError(
//         err.response?.data?.message || "Login failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter") {
//       handleSubmit();
//     }
//   };

//   // Show loading spinner while checking authentication
//   if (isCheckingAuth) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

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
//               <div className="relative">
//                 <input
//                   name="password"
//                   type={showPassword ? "text" : "password"}
//                   value={formData.password}
//                   onChange={handleChange}
//                   onKeyPress={handleKeyPress}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
//                   placeholder="••••••••"
//                   required
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
//                   onClick={() => setShowPassword(!showPassword)}
//                 >
//                   {showPassword ? (
//                     <svg
//                       className="h-5 w-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                       />
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                       />
//                     </svg>
//                   ) : (
//                     <svg
//                       className="h-5 w-5"
//                       fill="none"
//                       viewBox="0 0 24 24"
//                       stroke="currentColor"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
//                       />
//                     </svg>
//                   )}
//                 </button>
//               </div>
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
//                 loading ? "opacity-70 cursor-not-allowed" : ""
//               }`}
//             >
//               {loading ? "Signing in..." : "Sign In"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

// // "use client";

// // import { useEffect, useState } from "react";
// // import axios from "axios";
// // import { useRouter } from "next/navigation";
// // import { useUserDataStore } from "@/stores/userDataStore";
// // import { useAuth } from "@/context/AuthContext";

// // export default function LoginPage() {
// //   const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
// //   const { login } = useAuth();
// //   const router = useRouter();

// //   // Zustand store
// //   const setUserData = useUserDataStore((state) => state.setUserData);

// //   const [formData, setFormData] = useState({
// //     email: "",
// //     password: "",
// //   });
// //   const [rememberMe, setRememberMe] = useState(true);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState("");
// //   const [isCheckingAuth, setIsCheckingAuth] = useState(true);

// //   // Check for existing authentication and redirect if valid
// //   useEffect(() => {
// //     const checkExistingAuth = () => {
// //       try {
// //         const token = localStorage.getItem("Authorization");
// //         const role = localStorage.getItem("Role");
// //         const rememberMeStatus = localStorage.getItem("rememberMe") === "true";

// //         // Only redirect if we have a valid token, role, and remember me is enabled
// //         if (token && role && rememberMeStatus) {
// //           // Verify token is valid (you might want to add a proper token validation check here)
// //           if (token.startsWith("Bearer ")) {
// //             redirectBasedOnRole(role);
// //           } else {
// //             setIsCheckingAuth(false);
// //           }
// //         } else {
// //           setIsCheckingAuth(false);
// //         }
// //       } catch (err) {
// //         console.error("Error checking existing auth:", err);
// //         setIsCheckingAuth(false);
// //       }
// //     };

// //     checkExistingAuth();
// //   }, [router]);

// //   // Load saved credentials on component mount
// //   useEffect(() => {
// //     const savedEmail = localStorage.getItem("Email");
// //     const savedRememberMe = localStorage.getItem("rememberMe") === "true";

// //     if (savedEmail) {
// //       setFormData((prev) => ({ ...prev, email: savedEmail }));
// //     }
// //     setRememberMe(savedRememberMe);
// //   }, []);

// //   const redirectBasedOnRole = (role) => {
// //     switch (role) {
// //       case "talukaOfficer":
// //         router.push("/taluka-officer");
// //         break;
// //       case "superAdmin":
// //         router.push("/super-admin");
// //         break;
// //       case "districtOfficer":
// //         router.push("/district-officer");
// //         break;
// //       case "admin":
// //         router.push("/admin-dashboard");
// //         break;
// //       case "farmer":
// //         router.push("/farmer/dashboard");
// //         break;
// //       default:
// //         router.push("/");
// //     }
// //   };

// //   const handleChange = (e) => {
// //     setFormData({
// //       ...formData,
// //       [e.target.name]: e.target.value,
// //     });
// //     if (error) setError("");
// //   };

// //   const handleRememberMeChange = (e) => {
// //     setRememberMe(e.target.checked);
// //   };

// //   const handleSubmit = async (e) => {
// //     if (e) e.preventDefault();

// //     try {
// //       setLoading(true);
// //       setError("");

// //       if (!formData.email || !formData.password) {
// //         setError("Please fill in all fields");
// //         setLoading(false);
// //         return;
// //       }

// //       const res = await axios.post(`${BASE_URL}/api/auth/login`, formData, {
// //         withCredentials: true,
// //       });

// //       const data = res.data;
// //       console.log("Login response:", data);

// //       if (res.status === 200 && data.token) {
// //         // Save email if "Remember me" is checked
// //         if (rememberMe) {
// //           localStorage.setItem("Email", formData.email);
// //           localStorage.setItem("Role", data.role || data.data?.role);
// //           localStorage.setItem("Authorization", `Bearer ${data.token}`);
// //           localStorage.setItem("rememberMe", "true");
// //         } else {
// //           localStorage.removeItem("Email");
// //           localStorage.removeItem("Role");
// //           localStorage.removeItem("Authorization");
// //           localStorage.setItem("rememberMe", "false");
// //         }

// //         // Save user in Zustand store
// //         setUserData(data);

// //         // Redirect based on role
// //         const userRole = data.role || data.data?.role;
// //         // Save to context
// //         login({ role: userRole, token: data.token, email: formData.email });

// //         redirectBasedOnRole(userRole);
// //       } else {
// //         setError("Invalid credentials or server error");
// //       }
// //     } catch (err) {
// //       console.error("Login error:", err);
// //       setError(
// //         err.response?.data?.message || "Login failed. Please try again."
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === "Enter") {
// //       handleSubmit();
// //     }
// //   };

// //   // Show loading spinner while checking authentication
// //   if (isCheckingAuth) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   if (loading) {
// //     return (
// //       <div className="flex justify-center items-center h-screen">
// //         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
// //       <div className="max-w-md w-full space-y-8">
// //         <div className="bg-white rounded-lg shadow-md p-8">
// //           <div className="text-center mb-8">
// //             <h2 className="text-3xl font-bold text-gray-900">Login</h2>
// //             <p className="mt-2 text-sm text-gray-600">
// //               Sign in to access the admin panel
// //             </p>
// //           </div>

// //           {error && (
// //             <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
// //               <p>{error}</p>
// //             </div>
// //           )}

// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Email Address
// //               </label>
// //               <input
// //                 name="email"
// //                 type="email"
// //                 value={formData.email}
// //                 onChange={handleChange}
// //                 onKeyPress={handleKeyPress}
// //                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                 placeholder="admin@example.com"
// //                 required
// //               />
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Password
// //               </label>
// //               <input
// //                 name="password"
// //                 type="password"
// //                 value={formData.password}
// //                 onChange={handleChange}
// //                 onKeyPress={handleKeyPress}
// //                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
// //                 placeholder="••••••••"
// //                 required
// //               />
// //             </div>

// //             <div className="flex items-center justify-between">
// //               <div className="flex items-center">
// //                 <input
// //                   type="checkbox"
// //                   checked={rememberMe}
// //                   onChange={handleRememberMeChange}
// //                   className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
// //                 />
// //                 <span className="ml-2 block text-sm text-gray-700">
// //                   Remember me
// //                 </span>
// //               </div>

// //               <button
// //                 type="button"
// //                 className="text-sm text-blue-600 hover:text-blue-500"
// //               >
// //                 Forgot password?
// //               </button>
// //             </div>

// //             <button
// //               type="submit"
// //               disabled={loading}
// //               className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
// //                 loading ? "opacity-70 cursor-not-allowed" : ""
// //               }`}
// //             >
// //               {loading ? "Signing in..." : "Sign In"}
// //             </button>
// //           </form>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
