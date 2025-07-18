"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

export const useAuth = () => {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const verifyToken = async () => {
      let storedToken = localStorage.getItem("Authorization");

      // ✅ Check if storedToken is null before using it
      if (!storedToken) {
        toast.error("Please login to continue");
        router.replace("/admin/login");
        setChecking(false);
        return;
      }

      // ✅ Now it's safe to split
      const token = storedToken.split(' ')[1] || storedToken;

      try {
        // Optionally clean "Bearer " again
        storedToken = storedToken.replace("Bearer ", "");

        const res = await axios.get(`/api/protected`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.status === 200) {
          setUser(res.data.user);
          setToken(storedToken);
          localStorage.setItem("Authorization", storedToken);
        }
      } catch (err) {
        console.error("Token verification error:", err);

        localStorage.removeItem("Authorization");
        setToken(null);
        setUser(null);

        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please login again.");
        } else {
          toast.error("Authentication failed. Please login again.");
        }

        router.replace("/admin/login");
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [router]);


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.replace("/admin/login");
  };

  return { checking, user, token, logout };
};