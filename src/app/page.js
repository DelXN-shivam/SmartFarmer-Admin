"use client";
import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    window.location.href = '/admin/login';
  }, []); 

  return (
    <div>
      Home page
    </div>
  );
}
