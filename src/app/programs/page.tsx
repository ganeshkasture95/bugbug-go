// src/app/programs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProgramCard from '@/components/ProgramCard';
import CreateProgramModal from '@/components/CreateProgramModal';

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
  _count: {
    reports: number;
  };
  createdAt: string;
}

export default function ProgramsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-indigo-600 hover:text-indigo-800 mr-4"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-xl font-semibold">
                {user.role === 'Company' ? 'My Programs' : 'Bug Bounty Programs'}
              </h1>
            </div>
            {user.role === 'Company' && (
              <div className="flex items-center">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Create Program
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {programs.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                {user.role === 'Company' 
                  ? 'No programs created yet' 
                  : 'No active programs available'
                }
              </div>
              {user.role === 'Company' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium"
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
                  onDelete={handleDeleteProgram}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProgramModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProgram}
        loading={createLoading}
      />
    </div>
  );
}