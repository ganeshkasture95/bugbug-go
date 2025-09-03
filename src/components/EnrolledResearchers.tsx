// src/components/EnrolledResearchers.tsx
'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: string;
  title: string;
  severity: string;
  status: string;
  createdAt: string;
}

interface Researcher {
  id: string;
  name: string;
  email: string;
  xp: number;
  joinedAt: string;
  reportsCount: number;
  reports: Report[];
}

interface EnrollmentData {
  enrollmentId: string;
  enrolledAt: string;
  researcher: Researcher;
}

interface EnrolledResearchersProps {
  programId: string;
  isCompanyOwner: boolean;
}

export default function EnrolledResearchers({ programId, isCompanyOwner }: EnrolledResearchersProps) {
  const [researchers, setResearchers] = useState<EnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isCompanyOwner) {
      fetchResearchers();
    } else {
      setLoading(false);
    }
  }, [programId, isCompanyOwner]);

  const fetchResearchers = async () => {
    try {
      const response = await fetch(`/api/programs/${programId}/researchers`);
      if (response.ok) {
        const data = await response.json();
        setResearchers(data.researchers);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch researchers');
      }
    } catch (error) {
      console.error('Failed to fetch researchers:', error);
      setError('Failed to fetch researchers');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  if (!isCompanyOwner) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="text-lg font-semibold text-gray-900">Loading enrolled researchers...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Enrolled Researchers</h3>
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Enrolled Researchers ({researchers.length})
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Active researchers in your program
        </div>
      </div>

      {researchers.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg mb-2">No researchers enrolled yet</p>
          <p className="text-gray-400 text-sm">Researchers will appear here when they join your program</p>
        </div>
      ) : (
        <div className="space-y-4">
          {researchers.map((enrollment) => (
            <div key={enrollment.enrollmentId} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{enrollment.researcher.name}</h4>
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Enrolled
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{enrollment.researcher.email}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>XP: {enrollment.researcher.xp}</span>
                    <span>Joined: {formatDate(enrollment.enrolledAt)}</span>
                    <span>Reports: {enrollment.researcher.reportsCount}</span>
                  </div>
                </div>
              </div>

              {enrollment.researcher.reports.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Recent Reports:</h5>
                  <div className="space-y-2">
                    {enrollment.researcher.reports.slice(0, 3).map((report) => (
                      <div key={report.id} className="flex justify-between items-center text-sm">
                        <span className="text-gray-700 truncate flex-1 mr-2">{report.title}</span>
                        <div className="flex space-x-2 flex-shrink-0">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(report.severity)}`}>
                            {report.severity}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                            {report.status}
                          </span>
                        </div>
                      </div>
                    ))}
                    {enrollment.researcher.reports.length > 3 && (
                      <p className="text-xs text-gray-500">
                        +{enrollment.researcher.reports.length - 3} more reports
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}