// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    twoFactorEnabled: boolean;
}

export default function DashboardPage() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await fetch('/api/user/profile');
            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                // Clear any invalid tokens and redirect to login
                document.cookie = 'accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                document.cookie = 'refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
                router.push('/login');
            }
        } catch (error) {
            console.error('Failed to fetch user data:', error);
            router.push('/login');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-card shadow border-b border-border">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-foreground">SecureHunt</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-2 border-dashed border-border rounded-lg p-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-foreground mb-4">
                                {user.role} Dashboard
                            </h2>

                            <div className="card p-6 mb-6">
                                <h3 className="text-lg font-medium text-foreground mb-4">Account Information</h3>
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                                        <dd className="mt-1 text-sm text-foreground">{user.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                                        <dd className="mt-1 text-sm text-foreground">{user.email}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                                        <dd className="mt-1 text-sm text-foreground">{user.role}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-muted-foreground">2FA Status</dt>
                                        <dd className="mt-1 text-sm text-foreground">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.twoFactorEnabled
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                                            </span>
                                        </dd>
                                    </div>
                                </dl>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white shadow rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Security</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Manage your account security settings
                                    </p>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        Security Settings
                                    </button>
                                </div>

                                {user.role === 'Researcher' && (
                                    <>
                                        <div className="bg-white shadow rounded-lg p-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">Browse Programs</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Find active bug bounty programs
                                            </p>
                                            <button
                                                onClick={() => router.push('/programs')}
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                            >
                                                View Programs
                                            </button>
                                        </div>
                                        <div className="bg-white shadow rounded-lg p-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-2">Submit Report</h4>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Report a security vulnerability
                                            </p>
                                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                                New Report
                                            </button>
                                        </div>
                                    </>
                                )}

                                {user.role === 'Company' && (
                                    <div className="bg-white shadow rounded-lg p-6">
                                        <h4 className="text-lg font-medium text-gray-900 mb-2">Bug Bounty Programs</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Create and manage your programs
                                        </p>
                                        <button
                                            onClick={() => router.push('/programs')}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                        >
                                            Manage Programs
                                        </button>
                                    </div>
                                )}

                                <div className="bg-white shadow rounded-lg p-6">
                                    <h4 className="text-lg font-medium text-gray-900 mb-2">Profile</h4>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Update your profile information
                                    </p>
                                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}