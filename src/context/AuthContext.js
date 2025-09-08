"use client"
import { createContext, useState, useEffect, useContext } from "react";
import {jwtDecode} from "jwt-decode";  // static import now that v3 is installed

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!accessToken) {
      setUserRole(null);
      return;
    }

    try {
      const decoded = jwtDecode(accessToken);  // directly use jwtDecode here
      setUserRole(decoded.role);
    } catch (error) {
      console.error("Failed to decode token:", error);
      setUserRole(null);
    }
  }, [accessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, userRole, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);