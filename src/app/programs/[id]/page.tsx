// src/app/programs/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scope</h3>
                <div className="space-y-2">
                  {program.scope.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></span>
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

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