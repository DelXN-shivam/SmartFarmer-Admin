// src/components/AuthRedirectHandler.js
'use client';

import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const publicRoutes = ['/login', '/register', '/forgot-password'];
const protectedRoutes = ['/taluka-officer', '/super-admin', '/district-officer', '/admin-dashboard', '/farmer/dashboard'];

export default function AuthRedirectHandler({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublicRoute = publicRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname === route || pathname.startsWith(route + '/')
    );

    // If user is authenticated and tries to access public routes like login
    if (user && isPublicRoute) {
      redirectBasedOnRole(user.role);
      return;
    }

    // If user is not authenticated and tries to access protected routes
    if (!user && isProtectedRoute) {
      router.push('/login');
      return;
    }

    // If user is authenticated and on home page, redirect to appropriate dashboard
    if (user && pathname === '/') {
      redirectBasedOnRole(user.role);
    }
  }, [user, loading, pathname, router]);

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'talukaOfficer':
        router.push('/taluka-officer');
        break;
      case 'superAdmin':
        router.push('/super-admin');
        break;
      case 'districtOfficer':
        router.push('/district-officer');
        break;
      case 'admin':
        router.push('/admin-dashboard');
        break;
      case 'farmer':
        router.push('/farmer/dashboard');
        break;
      default:
        router.push('/');
    }
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return <>{children}</>;
}