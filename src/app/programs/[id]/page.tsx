// src/app/programs/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GitHubIssueCard from '@/components/GitHubIssueCard';
import SubmitReportModal from '@/components/SubmitReportModal';
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
  reports: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
    researcher: {
      name: string;
    };
  }>;
  githubRepo?: string;
  githubIssues?: string[];
  maintainerEmail?: string;
  codeLanguages?: string[];
  createdAt: string;
}

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProgram();
      if (user.role === 'Researcher') {
        checkEnrollmentStatus();
      }
    }
  }, [params.id, user]);

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

  const fetchProgram = async () => {
    try {
      const response = await fetch(`/api/programs/${params.id}`);
      if (response.ok) {
        const programData = await response.json();
        setProgram(programData);
      } else if (response.status === 404) {
        router.push('/programs');
      }
    } catch (error) {
      console.error('Failed to fetch program:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollmentStatus = async () => {
    try {
      const response = await fetch(`/api/programs/${params.id}/enroll`);
      if (response.ok) {
        const data = await response.json();
        setEnrolled(data.enrolled);
      }
    } catch (error) {
      console.error('Failed to check enrollment status:', error);
    }
  };

  const handleEnrollment = async () => {
    setEnrollmentLoading(true);
    try {
      const method = enrolled ? 'DELETE' : 'POST';
      const response = await fetch(`/api/programs/${params.id}/enroll`, {
        method,
      });

      if (response.ok) {
        setEnrolled(!enrolled);
        const data = await response.json();
        alert(data.message);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update enrollment');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to update enrollment');
    } finally {
      setEnrollmentLoading(false);
    }
  };

  const handleSubmitReport = async (reportData: any) => {
    setReportLoading(true);
    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        const newReport = await response.json();
        setShowReportModal(false);
        alert('Report submitted successfully!');
        // Refresh program data to show new report
        fetchProgram();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Report submission error:', error);
      alert('Failed to submit report');
    } finally {
      setReportLoading(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const getReportStatusColor = (status: string) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-100 text-blue-800';
      case 'InReview':
        return 'bg-yellow-100 text-yellow-800';
      case 'Validated':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      case 'Fixed':
        return 'bg-purple-100 text-purple-800';
      case 'Disclosed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg animate-pulse"></div>
          <div className="text-lg font-medium text-gray-900">Loading program details...</div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg text-gray-500 mb-4">Program not found</div>
          <button
            onClick={() => router.push('/programs')}
            className="btn-primary"
          >
            Back to Programs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <button
              onClick={() => router.push('/programs')}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors mb-4"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Programs
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{program.title}</h1>
            <p className="text-gray-600">by {program.company.name}</p>
          </div>

          {user.role === 'Researcher' && program.status === 'Active' && (
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEnrollment}
                disabled={enrollmentLoading}
                className={`px-6 py-3 rounded-lg font-semibold transition-colors ${enrolled
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50`}
              >
                {enrollmentLoading
                  ? (enrolled ? 'Leaving...' : 'Joining...')
                  : (enrolled ? 'Leave Program' : 'Join Program')
                }
              </button>

              {enrolled && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Submit Report
                </button>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Program Info */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(program.status)}`}>
                      {program.status}
                    </span>
                    {user.role === 'Researcher' && enrolled && (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        Enrolled
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Program Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{program.description}</p>
              </div>
            </div>

            {/* Scope */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Testing Scope</h3>
              <div className="space-y-3">
                {program.scope.map((item, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                    <span className="text-gray-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* GitHub Integration */}
            {(program.githubRepo || program.githubIssues?.length || program.codeLanguages?.length || program.maintainerEmail) && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub Integration
                </h3>

                {program.githubRepo && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Repository</h4>
                    <a
                      href={`https://github.com/${program.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                      {program.githubRepo}
                      <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                )}

                {program.codeLanguages && program.codeLanguages.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Programming Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {program.codeLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="inline-flex px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full font-medium"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {program.githubIssues && program.githubIssues.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Related GitHub Issues</h4>
                    <div className="space-y-3">
                      {program.githubIssues.map((issue, index) => (
                        <GitHubIssueCard
                          key={index}
                          issueUrl={issue}
                          repoUrl={program.githubRepo}
                          compact={true}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {program.maintainerEmail && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Maintainer Contact</h4>
                    <a
                      href={`mailto:${program.maintainerEmail}`}
                      className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {program.maintainerEmail}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Recent Reports */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Reports ({program.reports.length})
              </h3>
              {program.reports.length === 0 ? (
                <p className="text-gray-500">No reports submitted yet</p>
              ) : (
                <div className="space-y-4">
                  {program.reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">{report.title}</h4>
                        <div className="flex space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReportStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>by {report.researcher.name}</span>
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reward Structure</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Critical</span>
                  <span className="text-lg font-bold text-red-600">{formatCurrency(program.rewards.critical)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">High</span>
                  <span className="text-lg font-bold text-orange-600">{formatCurrency(program.rewards.high)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Medium</span>
                  <span className="text-lg font-bold text-yellow-600">{formatCurrency(program.rewards.medium)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Low</span>
                  <span className="text-lg font-bold text-blue-600">{formatCurrency(program.rewards.low)}</span>
                </div>
              </div>
            </div>

            {/* Program Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Program Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Reports</span>
                  <span className="font-medium">{program.reports.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="font-medium">{formatDate(program.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Company</span>
                  <span className="font-medium">{program.company.name}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>

              {user.role === 'Researcher' ? (
                <div className="space-y-4">
                  {program.status === 'Active' ? (
                    <>
                      <button
                        onClick={handleEnrollment}
                        disabled={enrollmentLoading}
                        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${enrolled
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-red-600 text-white hover:bg-red-700'
                          } disabled:opacity-50`}
                      >
                        {enrollmentLoading
                          ? (enrolled ? 'Leaving Program...' : 'Joining Program...')
                          : (enrolled ? 'Leave Program' : 'Join Program')
                        }
                      </button>

                      {enrolled && (
                        <button
                          onClick={() => setShowReportModal(true)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                        >
                          Submit Security Report
                        </button>
                      )}

                      {!enrolled && (
                        <p className="text-sm text-gray-500 text-center">
                          Join this program to submit security reports
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">This program is currently {program.status.toLowerCase()}</p>
                      <p className="text-sm text-gray-400">No new enrollments or reports accepted</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Company view - manage this program from your dashboard</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Submit Report Modal */}
      <SubmitReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
        programId={program.id}
        programTitle={program.title}
        loading={reportLoading}
      />
    </div>
  );
}