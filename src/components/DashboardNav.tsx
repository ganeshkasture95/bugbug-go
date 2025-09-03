// src/components/DashboardNav.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface DashboardNavProps {
    user: User;
    onLogout: () => void;
}

export default function DashboardNav({ user, onLogout }: DashboardNavProps) {
    const router = useRouter();
    const pathname = usePathname();

    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <nav className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link href="/dashboard" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-gray-900 text-xl font-bold">SecureHunt</span>
                </Link>
                
                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-8">
                    <Link 
                        href="/dashboard" 
                        className={`font-medium transition-colors ${
                            isActive('/dashboard') 
                                ? 'text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link 
                        href="/programs" 
                        className={`font-medium transition-colors ${
                            isActive('/programs') || pathname.startsWith('/programs/')
                                ? 'text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Programs
                    </Link>
                    {user.role === 'Researcher' && (
                        <Link 
                            href="/reports" 
                            className={`font-medium transition-colors ${
                                isActive('/reports') || pathname.startsWith('/reports/')
                                    ? 'text-red-600' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Reports
                        </Link>
                    )}
                    <Link 
                        href="/profile" 
                        className={`font-medium transition-colors ${
                            isActive('/profile') 
                                ? 'text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Profile
                    </Link>
                </div>

                {/* User Menu */}
                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="text-sm">
                            <div className="font-medium text-gray-700">{user.name}</div>
                            <div className="text-gray-500 capitalize">{user.role}</div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md transition-colors"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-4">
                    <Link 
                        href="/dashboard" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive('/dashboard') 
                                ? 'bg-red-100 text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Dashboard
                    </Link>
                    <Link 
                        href="/programs" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive('/programs') || pathname.startsWith('/programs/')
                                ? 'bg-red-100 text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Programs
                    </Link>
                    {user.role === 'Researcher' && (
                        <Link 
                            href="/reports" 
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                isActive('/reports') || pathname.startsWith('/reports/')
                                    ? 'bg-red-100 text-red-600' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            My Reports
                        </Link>
                    )}
                    <Link 
                        href="/profile" 
                        className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive('/profile') 
                                ? 'bg-red-100 text-red-600' 
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        Profile
                    </Link>
                </div>
            </div>
        </nav>
    );
}