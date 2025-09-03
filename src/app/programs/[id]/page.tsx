// src/app/programs/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import GitHubIssueCard from '@/components/GitHubIssueCard';

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
  createdAt: string;
}

export default function ProgramDetailPage({ params }: { params: { id: string } }) {
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchProgram();
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">Program not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/programs')}
                className="text-indigo-600 hover:text-indigo-800 mr-4"
              >
                ← Back to Programs
              </button>
              <h1 className="text-xl font-semibold">{program.title}</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Program Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{program.title}</h2>
                    <p className="text-gray-600">by {program.company.name}</p>
                  </div>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
                
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{program.description}</p>
                </div>
              </div>

              {/* Scope */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Scope</h3>
                <div className="space-y-2">
                  {program.scope.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-600 rounded-full mr-3"></span>
                      <span className="text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* GitHub Integration */}
              {(program.githubRepo || program.githubIssues?.length || program.codeLanguages?.length || program.maintainerEmail) && (
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
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

              {/* Submit Report Button */}
              <div className="bg-white shadow rounded-lg p-6">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-md font-medium">
                  Submit Report
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Found a vulnerability? Submit a report to this program
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}