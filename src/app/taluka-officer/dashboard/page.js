"use client"
import React, { useEffect, useState } from 'react';
import { Users, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';


export default function Dashboard() {
    // Sample data - you can replace this with actual data from your API
    const [farmerCount, setFarmerCount] = useState();
    const [verifierCount, setVerifierCount] = useState();
    const [loading, setLoading] = useState(false);
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const token = typeof window !== "undefined"
        ? localStorage.getItem('Authorization')?.split(' ')[1]
        : null;
    const getFarmerCount = async () => {
        try {
            setLoading(true)
            const res = await axios.get(`${BASE_URL}/api/farmers?count=true`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res.data)
            if (res.status == 200) {
                setFarmerCount(res.data.count)
            }
        } catch (err) {
            console.error(err);
            toast.error('Error while calulating Farmer Count')
        } finally {
            setLoading(false);
        }
    }

    const getVerifierCount = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${BASE_URL}/api/verifiers?count=true`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res.data)
            if (res.status == 200) {
                setVerifierCount(res.data.count)
            }
        } catch (err) {
            console.error(err);
            toast.error('Error while calulating Verifier Count')
        } finally {
            setLoading(false)
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
    }, [])

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
                        loading={loading}
                    />
                    <StatCard
                        title="Active Verifiers"
                        value={verifierCount}
                        icon={UserCheck}
                        bgColor="bg-green-100"
                        iconColor="text-green-600"
                        loading={loading}
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
