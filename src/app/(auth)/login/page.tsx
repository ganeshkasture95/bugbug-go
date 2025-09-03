// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        twoFactorCode: '',
        rememberMe: false,
    });
    const [requires2FA, setRequires2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                if (data.requires2FA) {
                    setRequires2FA(true);
                } else {
                    router.push('/dashboard');
                    router.refresh(); // Ensure middleware picks up the new auth state
                }
            } else {
                setError(data.error || 'Login failed');
            }
            
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'var(--background)' }}>
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold" style={{ color: 'var(--foreground)' }}>
                        Sign in to your account
                    </h2>
                    <p className="mt-2 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Secure access to the bug bounty platform
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="form-label">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className="form-input"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="form-input"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        {requires2FA && (
                            <div>
                                <label htmlFor="twoFactorCode" className="form-label">
                                    2FA Code
                                </label>
                                <input
                                    id="twoFactorCode"
                                    name="twoFactorCode"
                                    type="text"
                                    maxLength={6}
                                    className="form-input"
                                    placeholder="Enter 6-digit code"
                                    value={formData.twoFactorCode}
                                    onChange={(e) => setFormData({ ...formData, twoFactorCode: e.target.value })}
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                name="rememberMe"
                                type="checkbox"
                                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                checked={formData.rememberMe}
                                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm" style={{ color: 'var(--foreground)' }}>
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <Link href="/forgot-password" className="font-medium text-red-600 hover:text-red-700">
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Don't have an account?{' '}
                            <Link href="/register" className="font-medium text-red-600 hover:text-red-700">
                                Sign up
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}