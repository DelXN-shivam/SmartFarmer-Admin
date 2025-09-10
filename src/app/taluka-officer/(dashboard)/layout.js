"use client";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  Settings,
  BarChart3,
  Package,
  FileText,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  ChevronRight,
  Contact,
  Trees,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [activeItem, setActiveItem] = useState("Dashboard"); // Add active item state
  const [activeSubItem, setActiveSubItem] = useState(null); // Track active sub-item
  const router = useRouter();
  const sidebarItems = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/taluka-officer",
    },
    {
      icon: Trees,
      label: "Crops",
      href: "/taluka-officer/crop/all",
      subItems: [
        { label: "All Crops", href: "/taluka-officer/crop/all" },
        { label: "All Verified Crops", href: "/taluka-officer/crop/verified" },
        {
          label: "All Pending Crops",
          href: "/taluka-officer/crop/pending",
        },
        {
          label: "All Rejected Crops",
          href: "/taluka-officer/crop/rejected",
        },
      ],
    },
    {
      icon: Users,
      label: "Farmer",
      href: "/taluka-officer/farmer/all",
      subItems: [{ label: "All Farmers", href: "/taluka-officer/farmer/all" }],
    },
    {
      icon: Contact,
      label: "Verifier",
      href: "taluka-officer/verifier/all",
      subItems: [
        { label: "All Verifiers", href: "/taluka-officer/verifier/all" },
        // { label: "Verified", href: "/taluka-officer/verifier/verified" },
        // { label: "Unverified", href: "/taluka-officer/verifier/unverified" },
        { label: "Add Verifier", href: "/taluka-officer/verifier/add" },
      ],
    },
    {
      icon: BarChart3,
      label: "Analytics",
      href: "/admin/analytics",
      subItems: [
        { label: "Overview", href: "/admin/analytics/overview" },
        { label: "Reports", href: "/admin/analytics/reports" },
        { label: "Export", href: "/admin/analytics/export" },
      ],
    },
    {
      icon: FileText,
      label: "Reports",
      href: "/admin/reports",
      subItems: [
        { label: "Monthly", href: "/admin/reports/monthly" },
        { label: "Quarterly", href: "/admin/reports/quarterly" },
        { label: "Annual", href: "/admin/reports/annual" },
      ],
    },
  ];

  const toggleItem = (label) => {
    setExpandedItems((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const handleItemClick = (item) => {
    setActiveItem(item.label);
    setActiveSubItem(null);

    if (item.subItems) {
      toggleItem(item.label);
    } else {
      router.push(item.href); // Navigate to the main item's route
    }

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSubItemClick = (subItem, parentLabel) => {
    setActiveItem(parentLabel);
    setActiveSubItem(subItem.label);
    router.push(subItem.href); // Navigate to the sub-item's route

    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:inset-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TO</span>
            </div>
            <span className="ml-2 text-xl font-semibold text-gray-800">
              Taluka Officer
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav
          className="mt-6 px-3 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 8rem)" }}
        >
          {sidebarItems.map((item, index) => (
            <div key={index}>
              <div
                onClick={() => handleItemClick(item)}
                className={`flex items-center justify-between px-3 py-2 mt-1 text-sm rounded-lg transition-colors duration-200 cursor-pointer ${
                  activeItem === item.label
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.label}
                </div>
                {item.subItems &&
                  (expandedItems[item.label] ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  ))}
              </div>

              {item.subItems && expandedItems[item.label] && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.subItems.map((subItem, subIndex) => (
                    <a
                      key={subIndex}
                      href={subItem.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubItemClick(subItem, item.label);
                      }}
                      className={`block px-3 py-2 text-xs rounded-lg transition-colors duration-200 ${
                        activeSubItem === subItem.label
                          ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Admin User</p>
              <p className="text-xs text-gray-500">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* <div className="relative ml-4 lg:ml-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div> */}
            </div>

            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* User dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">AU</span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Admin User
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </a>
                    <hr className="my-1" />
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
