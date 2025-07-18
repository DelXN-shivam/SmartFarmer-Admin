"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function GoToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-black/70 text-white hover:bg-black/90 backdrop-blur-md shadow-lg transition-all"
    >
      <ArrowUp className="h-5 w-5" />
    </button>
  );
}
