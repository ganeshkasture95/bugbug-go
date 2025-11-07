// src/app/reports/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/DashboardNav';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Report {
  id: string;
  title: string;
  description: string;
  severity: string;
  vulnerabilityType: string;
  status: string;
  createdAt: string;
  program: {
    title: string;
    company: {
      name: string;
    };
  };
}

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (user) {
      fetchReports();
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

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const reportsData = await response.json();
        setReports(reportsData);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded-lg animate-pulse"></div>
          <div className="text-lg font-medium text-gray-900">Loading your reports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      <DashboardNav user={user} onLogout={handleLogout} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Security Reports</h1>
          <p className="text-gray-600">
            Track the status of your submitted vulnerability reports and their progress.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
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
                <p className="text-sm font-medium text-gray-600">Validated</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === 'Validated').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === 'InReview' || r.status === 'Submitted').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {reports.filter(r => r.severity === 'Critical').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No reports submitted yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start by enrolling in bug bounty programs and submitting your first security report.
            </p>
            <button
              onClick={() => router.push('/programs')}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Browse Programs
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{report.title}</h3>
                    <p className="text-gray-600 mb-3 line-clamp-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>Program: {report.program.title}</span>
                      <span>•</span>
                      <span>Company: {report.program.company.name}</span>
                      <span>•</span>
                      <span>Type: {report.vulnerabilityType}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(report.createdAt)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-500">
                    Submitted {formatDate(report.createdAt)}
                  </div>
                  <button className="text-red-600 hover:text-red-800 font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}