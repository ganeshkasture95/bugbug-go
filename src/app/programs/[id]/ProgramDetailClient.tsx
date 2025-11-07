'use client';

import DashboardNav from '@/components/DashboardNav';
import EnrolledResearchers from '@/components/EnrolledResearchers';
import SubmitReportModal from '@/components/SubmitReportModal';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

interface ProgramDetailClientProps {
  user: User;
  program: Program;
  initialEnrolled: boolean;
}

export default function ProgramDetailClient({ 
  user, 
  program, 
  initialEnrolled 
}: ProgramDetailClientProps) {
  const [enrolled, setEnrolled] = useState(initialEnrolled);
  const [enrollmentLoading, setEnrollmentLoading] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const router = useRouter();

  const handleEnrollment = async () => {
    if (enrolled) return;

    setEnrollmentLoading(true);
    try {
      const response = await fetch(`/api/programs/${program.id}/enroll`, {
        method: 'POST',
      });

      if (response.ok) {
        setEnrolled(true);
        alert('Successfully enrolled in the program!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to enroll in program');
      }
    } catch (error) {
      console.error('Failed to enroll in program:', error);
      alert('Failed to enroll in program');
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
        body: JSON.stringify({
          ...reportData,
          programId: program.id,
        }),
      });

      if (response.ok) {
        setShowReportModal(false);
        alert('Report submitted successfully!');
        // Optionally refresh the page or update state
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit report');
      }
    } catch (error) {
      console.error('Failed to submit report:', error);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Paused':
        return 'status-paused';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-closed';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Programs
        </button>

        {/* Program Header */}
        <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{program.title}</h1>
              <p className="text-lg text-gray-600 mb-4">by {program.company.name}</p>
              <div className="flex items-center space-x-4">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(program.status)}`}>
                  {program.status}
                </span>
                <span className="text-sm text-gray-500">
                  Created {formatDate(program.createdAt)}
                </span>
              </div>
            </div>
            
            {user.role === 'Researcher' && (
              <div className="mt-4 lg:mt-0 flex space-x-4">
                {!enrolled ? (
                  <button
                    onClick={handleEnrollment}
                    disabled={enrollmentLoading || program.status !== 'Active'}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    {enrollmentLoading ? 'Enrolling...' : 'Enroll in Program'}
                  </button>
                ) : (
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

          <p className="text-gray-700 text-lg leading-relaxed">{program.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scope */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Scope</h2>
              <div className="flex flex-wrap gap-3">
                {program.scope.map((item, index) => (
                  <span
                    key={index}
                    className="inline-flex px-3 py-2 text-sm bg-red-50 text-red-800 rounded-lg border border-red-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* GitHub Integration */}
            {(program.githubRepo || program.codeLanguages?.length || program.githubIssues?.length) && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub Integration
                </h2>
                
                {program.githubRepo && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Repository</h3>
                    <a 
                      href={`https://github.com/${program.githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="github-repo-link text-lg"
                    >
                      {program.githubRepo}
                    </a>
                  </div>
                )}
                
                {program.codeLanguages && program.codeLanguages.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Programming Languages</h3>
                    <div className="flex flex-wrap gap-2">
                      {program.codeLanguages.map((lang, index) => (
                        <span
                          key={index}
                          className="language-tag text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {program.githubIssues && program.githubIssues.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Related Issues</h3>
                    <p className="text-gray-600">
                      {program.githubIssues.length} issue{program.githubIssues.length !== 1 ? 's' : ''} linked to this program
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Company Actions */}
            {user.role === 'Company' && (
              <EnrolledResearchers programId={program.id} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Rewards */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Reward Structure</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Low Severity</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(program.rewards.low)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Medium Severity</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(program.rewards.medium)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">High Severity</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(program.rewards.high)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Critical Severity</span>
                  <span className="font-semibold text-red-600">{formatCurrency(program.rewards.critical)}</span>
                </div>
              </div>
            </div>

            {/* Program Stats */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Program Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Reports Submitted</span>
                  <span className="font-semibold text-gray-900">{program._count?.reports || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-semibold ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold text-gray-900">{formatDate(program.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            {program.maintainerEmail && (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Contact</h3>
                <p className="text-gray-600 mb-2">Maintainer Email:</p>
                <a 
                  href={`mailto:${program.maintainerEmail}`}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  {program.maintainerEmail}
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Submit Report Modal */}
      {showReportModal && (
        <SubmitReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          onSubmit={handleSubmitReport}
          programId={program.id}
          programTitle={program.title}
          loading={reportLoading}
        />
      )}
    </div>
  );
}
