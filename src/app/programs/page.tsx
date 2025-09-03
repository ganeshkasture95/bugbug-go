// src/app/programs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgramCard from '@/components/ProgramCard';
import CreateProgramModal from '@/components/CreateProgramModal';
import EditProgramModal from '@/components/EditProgramModal';
import DashboardNav from '@/components/DashboardNav';

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

export default function ProgramsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchPrograms();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      router.push('/login');
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch('/api/programs');
      if (response.ok) {
        const programsData = await response.json();
        setPrograms(programsData);
      }
    } catch (error) {
      console.error('Failed to fetch programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (programData: any) => {
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
        setPrograms([newProgram, ...programs]);
        setShowCreateModal(false);
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

  const handleEditProgram = (program: Program) => {
    setEditingProgram(program);
    setShowEditModal(true);
  };

  const handleUpdateProgram = async (programData: any) => {
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
        setPrograms(programs.map(p => p.id === editingProgram.id ? updatedProgram : p));
        setShowEditModal(false);
        setEditingProgram(null);
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
    if (!confirm('Are you sure you want to delete this program?')) {
      return;
    }

    try {
      const response = await fetch(`/api/programs/${programId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrograms(programs.filter(p => p.id !== programId));
      } else {
        alert('Failed to delete program');
      }
    } catch (error) {
      console.error('Failed to delete program:', error);
      alert('Failed to delete program');
    }
  };

  const handleViewDetails = (programId: string) => {
    router.push(`/programs/${programId}`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {user.role === 'Company'
                ? 'Manage Your Security Programs'
                : 'Discover Bug Bounty Opportunities'}
            </h2>
            <p className="text-gray-600">
              {user.role === 'Company'
                ? 'Create and manage bug bounty programs to secure your applications.'
                : 'Find active programs, hunt for vulnerabilities, and earn rewards.'}
            </p>
          </div>
          {user.role === 'Company' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center"
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
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {user.role === 'Company'
                ? 'No programs created yet'
                : 'No active programs available'}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {user.role === 'Company'
                ? 'Get started by creating your first bug bounty program to connect with security researchers.'
                : 'Check back later for new bug bounty programs or contact companies directly.'}
            </p>
            {user.role === 'Company' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Program
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Stats Bar */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{programs.length}</div>
                  <div className="text-sm text-gray-600">Total Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {programs.filter(p => p.status === 'Active').length}
                  </div>
                  <div className="text-sm text-gray-600">Active Programs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {programs.reduce((sum, p) => sum + (p._count?.reports || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Reports</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    ${programs.reduce((sum, p) => sum + p.rewards.critical + p.rewards.high + p.rewards.medium + p.rewards.low, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Rewards</div>
                </div>
              </div>
            </div>

            {/* Programs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <ProgramCard
                  key={program.id}
                  program={program}
                  userRole={user.role}
                  onEdit={handleEditProgram}
                  onDelete={handleDeleteProgram}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <CreateProgramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProgram}
        loading={createLoading}
      />

      {editingProgram && (
        <EditProgramModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setEditingProgram(null);
          }}
          onSubmit={handleUpdateProgram}
          program={editingProgram}
          loading={editLoading}
        />
      )}
    </div>
  );
}