// src/app/layout.js
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import AuthRedirectHandler from "@/components/AuthRedirectHandler";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata = {
  title: "Your App",
  description: "Your app description",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <AuthRedirectHandler>{children}</AuthRedirectHandler>
          <Toaster richColors position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}
