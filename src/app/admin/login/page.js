'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async () => {
        try {
            const res = await axios.post(`${BASE_URL}/api/admin/login`, formData);
            const data = res.data;

            const token = `Bearer ${data.token}`;
            if (res.status === 200 && token) {
                localStorage.setItem('Authorization', token);
                router.push('/admin/dashboard');
            } else {
                console.log('Error while admin login');
            }
        } catch (err) {
            console.log('Inside catch, error:', err.response?.data || err.message);
        }

        console.log('Login attempt:', formData);
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900">Admin Login</h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Sign in to access the admin panel
                        </p>
                    </div>

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
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}