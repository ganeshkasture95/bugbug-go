'use client';

import DashboardNav from '@/components/DashboardNav';
import ProgramCard from '@/components/ProgramCard';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const CreateProgramModal = dynamic(() => import('@/components/CreateProgramModal'), {
    ssr: false
});

const EditProgramModal = dynamic(() => import('@/components/EditProgramModal'), {
    ssr: false
});

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Program {
    id: string;
    title: string;
    description: string;
    scope: string[];
    rewards: {
        low: number;
        medium: number;
        high: number;
        critical: number;
    };
    status: 'Active' | 'Paused' | 'Closed';
    company: {
        name: string;
        email: string;
    };
    _count?: {
        reports: number;
    };
    githubRepo?: string;
    githubIssues?: string[];
    maintainerEmail?: string;
    codeLanguages?: string[];
    createdAt: string;
}

interface ProgramsClientProps {
    user: User;
    initialPrograms: Program[];
}

export default function ProgramsClient({ user, initialPrograms }: ProgramsClientProps) {
    const [programs, setPrograms] = useState<Program[]>(initialPrograms);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createLoading, setCreateLoading] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProgram, setEditingProgram] = useState<Program | null>(null);
    const [editLoading, setEditLoading] = useState(false);
    const router = useRouter();

    const handleCreateProgram = async (programData: {
        title: string;
        description: string;
        scope: string[];
        rewards: {
            low: number;
            medium: number;
            high: number;
            critical: number;
        };
        githubRepo?: string;
        githubIssues?: string[];
        maintainerEmail?: string;
        codeLanguages?: string[];
    }) => {
        setCreateLoading(true);
        try {
            const response = await fetch('/api/programs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData),
            });

            if (response.ok) {
                const newProgram = await response.json();
                setPrograms(prev => [newProgram, ...prev]);
                setShowCreateModal(false);
                alert('Program created successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to create program');
            }
        } catch (error) {
            console.error('Failed to create program:', error);
            alert('Failed to create program');
        } finally {
            setCreateLoading(false);
        }
    };

    const handleEditProgram = async (programData: {
        title: string;
        description: string;
        scope: string[];
        rewards: {
            low: number;
            medium: number;
            high: number;
            critical: number;
        };
        githubRepo?: string;
        githubIssues?: string[];
        maintainerEmail?: string;
        codeLanguages?: string[];
    }) => {
        if (!editingProgram) return;

        setEditLoading(true);
        try {
            const response = await fetch(`/api/programs/${editingProgram.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(programData),
            });

            if (response.ok) {
                const updatedProgram = await response.json();
                setPrograms(prev => prev.map(p => p.id === editingProgram.id ? updatedProgram : p));
                setShowEditModal(false);
                setEditingProgram(null);
                alert('Program updated successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to update program');
            }
        } catch (error) {
            console.error('Failed to update program:', error);
            alert('Failed to update program');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteProgram = async (programId: string) => {
        if (!confirm('Are you sure you want to delete this program?')) return;

        try {
            const response = await fetch(`/api/programs/${programId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setPrograms(prev => prev.filter(p => p.id !== programId));
                alert('Program deleted successfully!');
            } else {
                const error = await response.json();
                alert(error.error || 'Failed to delete program');
            }
        } catch (error) {
            console.error('Failed to delete program:', error);
            alert('Failed to delete program');
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
            <DashboardNav user={user} onLogout={handleLogout} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {user.role === 'Company' ? 'Your Programs' : 'Bug Bounty Programs'}
                        </h1>
                        <p className="text-gray-600">
                            {user.role === 'Company'
                                ? 'Manage your bug bounty programs and track security reports.'
                                : 'Discover and enroll in active bug bounty programs to earn rewards.'
                            }
                        </p>
                    </div>

                    {user.role === 'Company' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-4 sm:mt-0 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Program
                        </button>
                    )}
                </div>

                {/* Programs Grid */}
                {programs.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {user.role === 'Company' ? 'No Programs Yet' : 'No Active Programs'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {user.role === 'Company'
                                ? 'Create your first bug bounty program to start receiving security reports.'
                                : 'Check back later for new bug bounty opportunities.'
                            }
                        </p>
                        {user.role === 'Company' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                Create Your First Program
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.map((program) => (
                            <ProgramCard
                                key={program.id}
                                program={program}
                                userRole={user.role}
                                onEdit={user.role === 'Company' ? () => {
                                    setEditingProgram(program);
                                    setShowEditModal(true);
                                } : undefined}
                                onDelete={user.role === 'Company' ? () => handleDeleteProgram(program.id) : undefined}
                                onViewDetails={(programId) => router.push(`/programs/${programId}`)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Create Program Modal */}
            {showCreateModal && (
                <CreateProgramModal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSubmit={handleCreateProgram}
                    loading={createLoading}
                />
            )}

            {/* Edit Program Modal */}
            {showEditModal && editingProgram && (
                <EditProgramModal
                    isOpen={showEditModal}
                    onClose={() => {
                        setShowEditModal(false);
                        setEditingProgram(null);
                    }}
                    onSubmit={handleEditProgram}
                    program={editingProgram}
                    loading={editLoading}
                />
            )}
        </div>
    );
}
