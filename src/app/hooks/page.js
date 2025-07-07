"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export const useAuth = () => {
  const [checking, setChecking] = useState(true);
  const [user, setUser] = useState(null);
  const router = useRouter();

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("Authorization");

      if (!token) {
        router.replace("/admin/dashboard/login");
        return;
      }

      try {
        const res = await axios.get(`${BASE_URL}/api/protected`, {
          headers: {
            Authorization: `Bearer ${token}`, // or `Bearer ${token}` if stored raw
          },
        });

        if (res.status === 200 && res.data?.user) {
          setUser(res.data.user); // optional: set user details
        } else {
          throw new Error("Invalid token");
        }
      } catch (err) {
        console.error("Token verification failed:", err.message);
        localStorage.removeItem("Authorization");
        router.replace("/admin/dashboard/login");
      } finally {
        setChecking(false);
      }
    };

    verifyToken();
  }, [router, BASE_URL]);

  return { checking, user };
};
