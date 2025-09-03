// src/app/(auth)/register/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'Researcher',
        companyName: '',
        acceptTerms: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                router.push('/dashboard');
                router.refresh(); // Ensure middleware picks up the new auth state
            } else {
                // Show detailed validation errors if available
                if (data.details && Array.isArray(data.details)) {
                    const errorMsg = data.details.map((detail: any) => detail.message).join(', ');
                    setError(errorMsg);
                } else {
                    setError(data.error || data.message || 'Registration failed');
                }
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
                        Create your account
                    </h2>
                    <p className="mt-2 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                        Join the secure bug bounty platform
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
                            <label htmlFor="name" className="form-label">
                                Full Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="form-input"
                                placeholder="Enter your full name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

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
                            <label htmlFor="role" className="form-label">
                                Account Type
                            </label>
                            <select
                                id="role"
                                name="role"
                                className="form-input form-select"
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            >
                                <option value="Researcher">Security Researcher</option>
                                <option value="Company">Company</option>
                            </select>
                        </div>

                        {formData.role === 'Company' && (
                            <div>
                                <label htmlFor="companyName" className="form-label">
                                    Company Name
                                </label>
                                <input
                                    id="companyName"
                                    name="companyName"
                                    type="text"
                                    required
                                    className="form-input"
                                    placeholder="Enter your company name"
                                    value={formData.companyName}
                                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                />
                            </div>
                        )}

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
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <p className="form-help">
                                Must be 8+ characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="form-label">
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                className="form-input"
                                placeholder="Confirm your password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="acceptTerms"
                            name="acceptTerms"
                            type="checkbox"
                            required
                            className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                            checked={formData.acceptTerms}
                            onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                        />
                        <label htmlFor="acceptTerms" className="ml-2 block text-sm" style={{ color: 'var(--foreground)' }}>
                            I agree to the{' '}
                            <Link href="/terms" className="text-red-600 hover:text-red-700">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-red-600 hover:text-red-700">
                                Privacy Policy
                            </Link>
                        </label>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>
                    </div>

                    <div className="text-center">
                        <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-red-600 hover:text-red-700">
                                Sign in
                            </Link>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
}