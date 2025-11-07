'use client';

import DashboardNav from '@/components/DashboardNav';
import EditProfileModal from '@/components/EditProfileModal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface Report {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
  program: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
}

interface Program {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  reports: Array<{
    id: string;
    severity: string;
    status: string;
  }>;
  enrollments: Array<{
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }>;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  website?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
  twoFactorEnabled: boolean;
  xp: number;
  createdAt: string;
  badges: Badge[];
  reports: Report[];
  programs: Program[];
  stats: {
    totalReports: number;
    totalPrograms: number;
    totalEarnings: number;
    totalXP: number;
  };
  severityBreakdown: Record<string, number>;
  programStats: Record<string, number>;
}

interface ProfileClientProps {
  profileData: UserProfile;
}

export default function ProfileClient({ profileData }: ProfileClientProps) {
  const [user, setUser] = useState<UserProfile>(profileData);
  const [activeTab, setActiveTab] = useState('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      case 'Fixed':
        return 'bg-green-100 text-green-800';
      case 'InReview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleUpdateProfile = async (profileData: {
    name: string;
    bio?: string;
    website?: string;
    twitter?: string;
    linkedin?: string;
    github?: string;
  }) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(prev => ({ ...prev, ...updatedUser.user }));
        setShowEditModal(false);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg animate-pulse"></div>
          <div className="text-lg font-medium text-gray-900">Loading your profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="w-24 h-24 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.name}</h1>
                <p className="text-lg text-gray-600 mb-2">
                  {user.role} • {user.xp} XP
                </p>
                <p className="text-gray-500">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
            
            <button
              onClick={() => setShowEditModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Edit Profile
            </button>
          </div>

          {user.bio && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700">{user.bio}</p>
            </div>
          )}

          {/* Social Links */}
          {(user.website || user.twitter || user.linkedin || user.github) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Links</h3>
              <div className="flex flex-wrap gap-4">
                {user.website && (
                  <a
                    href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-red-600 hover:text-red-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0 9c-5 0-9-4-9-9s4-9 9-9" />
                    </svg>
                    Website
                  </a>
                )}
                {user.twitter && (
                  <a
                    href={`https://twitter.com/${user.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
                    </svg>
                    Twitter
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={`https://linkedin.com/in/${user.linkedin}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-700 hover:text-blue-900 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    LinkedIn
                  </a>
                )}
                {user.github && (
                  <a
                    href={`https://github.com/${user.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-gray-800 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'Researcher' ? 'Reports Submitted' : 'Programs Created'}
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.role === 'Researcher' ? user.stats.totalReports : user.stats.totalPrograms}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total XP</p>
                <p className="text-2xl font-bold text-gray-900">{user.xp}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {user.role === 'Researcher' ? 'Total Earned' : 'Rewards Paid'}
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(user.stats.totalEarnings)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Badges Earned</p>
                <p className="text-2xl font-bold text-gray-900">{user.badges.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'reports', 'badges'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
              {user.role === 'Company' && (
                <button
                  onClick={() => setActiveTab('programs')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                    activeTab === 'programs'
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Programs
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Severity Breakdown for Researchers */}
            {user.role === 'Researcher' && Object.keys(user.severityBreakdown).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Report Severity Breakdown</h3>
                <div className="space-y-3">
                  {Object.entries(user.severityBreakdown).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(severity)}`}>
                        {severity}
                      </span>
                      <span className="font-medium">{count} reports</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Program Stats for Companies */}
            {user.role === 'Company' && Object.keys(user.programStats).length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Program Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Programs</span>
                    <span className="font-medium">{user.programStats.totalPrograms || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Reports</span>
                    <span className="font-medium">{user.programStats.totalReports || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Researchers</span>
                    <span className="font-medium">{user.programStats.totalResearchers || 0}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {user.reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{report.title}</p>
                      <p className="text-sm text-gray-500">{report.program.title}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">{formatDate(report.createdAt)}</p>
                    </div>
                  </div>
                ))}
                {user.reports.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No activity yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">All Reports</h3>
            <div className="space-y-4">
              {user.reports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{report.title}</h4>
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Program: {report.program.title} by {report.program.company.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted on {formatDate(report.createdAt)}
                  </p>
                </div>
              ))}
              {user.reports.length === 0 && (
                <p className="text-gray-500 text-center py-8">No reports submitted yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Earned Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {user.badges.map((badge) => (
                <div key={badge.id} className="border border-gray-200 rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">{badge.icon}</span>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">{badge.name}</h4>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              ))}
              {user.badges.length === 0 && (
                <div className="col-span-full text-center py-8">
                  <p className="text-gray-500">No badges earned yet</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Complete challenges and submit reports to earn badges!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'programs' && user.role === 'Company' && (
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Your Programs</h3>
            <div className="space-y-4">
              {user.programs.map((program) => (
                <div key={program.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{program.title}</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      program.status === 'Active' ? 'bg-green-100 text-green-800' : 
                      program.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {program.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Reports:</span>
                      <span className="ml-2 font-medium">{program.reports.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Researchers:</span>
                      <span className="ml-2 font-medium">{program.enrollments.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <span className="ml-2 font-medium">{formatDate(program.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {user.programs.length === 0 && (
                <p className="text-gray-500 text-center py-8">No programs created yet</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateProfile}
          currentProfile={{
            name: user.name,
            bio: user.bio,
            website: user.website,
            twitter: user.twitter,
            linkedin: user.linkedin,
            github: user.github,
          }}
        />
      )}
    </div>
  );
}