'use client';

import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { AuthContext } from '@/context/AuthContext';

export default function LoginPage() {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const { setAccessToken, setUserRole } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            setError('');
            
            if (!formData.email || !formData.password) {
                setError('Please fill in all fields');
                setLoading(false);
                return;
            }

            // const res = await axios.post(`${BASE_URL}/api/auth/login`, formData);
            const res = await axios.post(` https://smart-farmer-backend.vercel.app/api/auth/admin/login`, formData , {withCredentials : true});
            const data = res.data;
            console.log('Login response:', data);

            // if (res.status === 200 && data.accessToken && data.role) {
            //     // Save token and role in context
            //     setAccessToken(data.accessToken);
            //     setUserRole(data.role);
            
            if (res.status === 200 && data.token) {
                // Save token and role in context
                setAccessToken(data.token);
                setUserRole(data.data?.role || 'admin'); // Use optional chaining

                // Redirect based on role
                // if (data.role === 'talukaOfficer') {
                //     router.push('/taluka-officer');
                // } else if (data.role === 'superAdmin') {
                //     router.push('/super-admin');
                // }else if (data.role === 'districtOfficer') {
                //     router.push('/district-officer');
                // } else {
                //     router.push('/');
                // }

                if (data.data?.role === 'talukaOfficer') {
                    router.push('/taluka-officer');
                } else if (data.data?.role === 'superAdmin') {
                    router.push('/super-admin');
                } else if (data.data?.role === 'districtOfficer') {
                    router.push('/district-officer');
                } else if (data.data?.role === 'admin') {
                    router.push('/admin-dashboard'); // Add admin route
                } else {
                    router.push('/');
                }
            } else {
                setError('Invalid credentials or server error');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        // your existing JSX unchanged
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to access the admin panel
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
                            <p>{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 block text-sm text-gray-700">
                                    Remember me
                                </span>
                            </div>

                            <button className="text-sm text-blue-600 hover:text-blue-500">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
                                loading ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
