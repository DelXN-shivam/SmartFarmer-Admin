"use client"
import React, { useEffect, useState, useContext } from 'react';
import { Users, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { AuthContext } from '@/context/AuthContext'; // Make sure to import your AuthContext




export default function Dashboard() {
    // Sample data - you can replace this with actual data from your API
    const [farmerCount, setFarmerCount] = useState();
    const [verifierCount, setVerifierCount] = useState();
    const [loading, setLoading] = useState(false);
    const [farmerLoading, setFarmerLoading] = useState(false); // Fixed: Separate loading states
    const [verifierLoading, setVerifierLoading] = useState(false);
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    // const token = typeof window !== "undefined"
    //     ? localStorage.getItem('Authorization')?.split(' ')[1]
    //     : null;


    const { accessToken } = useContext(AuthContext);

    
    // const getFarmerCount = async () => {
    //     try {
    //         setLoading(true)
    //         const res = await axios.get(`${BASE_URL}/api/farmer/count`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
    //         console.log(res.data)
    //         if (res.status == 200) {
    //             setFarmerCount(res.data.count)
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('Error while calulating Farmer Count')
    //     } finally {
    //         setLoading(false);
    //     }
    // }


    const getFarmerCount = async () => {
        try {
            setFarmerLoading(true);
            // ✅ CORRECT ENDPOINT: /api/farmers/count
            const res = await axios.get(`${BASE_URL}/api/farmer/count`);
            
            console.log('Farmer count response:', res.data);
            
            if (res.status === 200) {
                setFarmerCount(res.data.count);
            }
        } catch (err) {
            console.error('Farmer count error:', err);
            toast.error('Error while calculating Farmer Count');
        } finally {
            setFarmerLoading(false);
        }
    }

    // const getVerifierCount = async () => {
    //     try {
    //         setLoading(true);
    //         const res = await axios.get(`${BASE_URL}/api/verifiers?count=true`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })
    //         console.log(res.data)
    //         if (res.status == 200) {
    //             setVerifierCount(res.data.count)
    //         }
    //     } catch (err) {
    //         console.error(err);
    //         toast.error('Error while calulating Verifier Count')
    //     } finally {
    //         setLoading(false)
    //     }
    // }
    const getVerifierCount = async () => {
        try {
            setVerifierLoading(true);
            // ✅ CORRECT ENDPOINT from verifierRouter.js
            const res = await axios.get(`${BASE_URL}/api/verifier/count`);
            
            console.log('Verifier count response:', res.data);
            
            if (res.status === 200) {
                // Your countVerifier controller returns: { message: "Count calculated for verifier", count }
                setVerifierCount(res.data.count);
            }
        } catch (err) {
            console.error('Verifier count error:', err);
            if (err.response?.status === 401) {
                toast.error('Please login again');
            } else {
                toast.error('Error while calculating Verifier Count');
            }
        } finally {
            setVerifierLoading(false);
        }
    }

    const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, loading }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-gray-600 text-sm font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {loading ? (
                            <span className="inline-block h-6 w-24 bg-gray-200 rounded animate-pulse" />
                        ) : (
                            value
                        )}
                    </p>
                </div>
                <div className={`${bgColor} p-3 rounded-full`}>
                    <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
            </div>
        </div>
    );

    useEffect(() => {
        console.log("Dashboard mounted");
        getFarmerCount();
        getVerifierCount();
    }, [accessToken]); // Added accessToken as dependency

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-2">Overview of your agricultural network</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
                    <StatCard
                        title="Total Farmers"
                        value={farmerCount}
                        icon={Users}
                        bgColor="bg-blue-100"
                        iconColor="text-blue-600"
                        loading={farmerLoading} // Fixed: using correct loading state
                    />
                    <StatCard
                        title="Active Verifiers"
                        value={verifierCount}
                        icon={UserCheck}
                        bgColor="bg-green-100"
                        iconColor="text-green-600"
                        loading={verifierLoading} // Fixed: using correct loading state
                    />
                </div>

                {/* Additional Dashboard Content */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="text-gray-600">
                        <p>Recent activity and updates will appear here...</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
