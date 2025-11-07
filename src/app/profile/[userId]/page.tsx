// src/app/profile/[userId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

interface PublicProfile {
  id: string;
  name: string;
  role: string;
  xp: number;
  createdAt: string;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
  }>;
  stats: {
    totalReports: number;
    validatedReports: number;
    rank: string;
  };
  recentReports: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
    program: {
      title: string;
      company: {
        name: string;
      };
    };
  }>;
}

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function PublicProfilePage({ params }: { params: Promise<{ userId: string }> }) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const initializeParams = async () => {
      const resolvedParams = await params;
      setUserId(resolvedParams.userId);
    };
    initializeParams();
  }, [params]);

  useEffect(() => {
    if (userId) {
      fetchCurrentUser();
      fetchPublicProfile();
    }
  }, [userId]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to fetch current user:', error);
      router.push('/login');
    }
  };

  const fetchPublicProfile = async () => {
    try {
      const response = await fetch(`/api/user/public/${userId}`);
      if (response.ok) {
        const profileData = await response.json();
        setProfile(profileData);
      } else if (response.status === 404) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to fetch public profile:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validated':
        return 'bg-green-100 text-green-800';
      case 'InReview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Legend':
        return 'bg-purple-100 text-purple-800';
      case 'Expert':
        return 'bg-red-100 text-red-800';
      case 'Advanced':
        return 'bg-orange-100 text-orange-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Beginner':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg animate-pulse"></div>
          <div className="text-lg font-medium text-gray-900">Loading profile...</div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
        <DashboardNav user={currentUser} onLogout={handleLogout} />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="text-lg text-gray-500 mb-4">Profile not found</div>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={currentUser} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white shadow-lg rounded-xl p-8 border border-gray-200 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {profile.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.name}</h1>
                <div className="flex items-center space-x-4 mb-3">
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRankColor(profile.stats.rank)}`}>
                    {profile.stats.rank}
                  </span>
                  <span className="text-gray-500 capitalize">{profile.role}</span>
                </div>
                <div className="flex items-center space-x-6 text-sm text-gray-500">
                  <span>XP: {profile.xp.toLocaleString()}</span>
                  <span>Joined: {formatDate(profile.createdAt)}</span>
                </div>
              </div>
            </div>
            {currentUser.id === profile.id && (
              <button
                onClick={() => router.push('/profile')}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Stats */}
        {profile.role === 'Researcher' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Reports</p>
                  <p className="text-3xl font-bold text-gray-900">{profile.stats.totalReports}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Validated</p>
                  <p className="text-3xl font-bold text-green-600">{profile.stats.validatedReports}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {profile.stats.totalReports > 0 
                      ? Math.round((profile.stats.validatedReports / profile.stats.totalReports) * 100)
                      : 0}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Reports */}
            {profile.role === 'Researcher' && profile.recentReports.length > 0 && (
              <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
                <div className="space-y-4">
                  {profile.recentReports.map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>{report.program.company.name} - {report.program.title}</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Badges</h3>
              {profile.badges.length > 0 ? (
                <div className="space-y-4">
                  {profile.badges.slice(0, 3).map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="text-2xl">{badge.icon}</div>
                      <div>
                        <h4 className="font-medium text-gray-900">{badge.name}</h4>
                        <p className="text-sm text-gray-600">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                  {profile.badges.length > 3 && (
                    <p className="text-sm text-gray-500 text-center">
                      +{profile.badges.length - 3} more badges
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <p className="text-gray-500">No badges yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}