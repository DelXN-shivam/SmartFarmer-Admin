// src/components/LogoutButton.js
'use client';

import { useAuth } from '@/context/AuthContext';
import { useUserDataStore } from '@/stores/userDataStore';
import { useCropStore } from '@/stores/cropStore';
import { useFarmerStore } from '@/stores/farmerStore';
import { useVerifierStore } from '@/stores/verifierStore';
import { useAdminStore } from '@/stores/adminStore';
import { LogOut } from 'lucide-react';

export default function LogoutButton({ 
  variant = 'default', 
  className = '', 
  showIcon = true,
  children 
}) {
  const { logout } = useAuth();
  const { clearUserData } = useUserDataStore();
  const { clearStore: clearCropStore } = useCropStore();
  const { clearStore: clearFarmerStore } = useFarmerStore();
  const { clearStore: clearVerifierStore } = useVerifierStore();
  const { clearStore: clearAdminStore } = useAdminStore();

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      // Clear all Zustand stores
      clearUserData();
      clearCropStore();
      clearFarmerStore();
      clearVerifierStore();
      clearAdminStore();
      
      // Call the main logout function from AuthContext
      logout();
    }
  };

  // Different button variants
  const getButtonClasses = () => {
    const baseClasses = "flex items-center transition-colors";
    
    switch (variant) {
      case 'dropdown':
        return `${baseClasses} w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 ${className}`;
      case 'header':
        return `${baseClasses} px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ${className}`;
      case 'sidebar':
        return `${baseClasses} px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md ${className}`;
      case 'minimal':
        return `${baseClasses} px-2 py-1 text-sm text-red-600 hover:text-red-800 ${className}`;
      default:
        return `${baseClasses} px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md ${className}`;
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={getButtonClasses()}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      {children || 'Logout'}
    </button>
  );
}