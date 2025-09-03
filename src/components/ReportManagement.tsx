// src/components/ReportManagement.tsx
'use client';

import { useEffect, useState } from 'react';

interface Report {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  vulnerabilityType: string;
  createdAt: string;
  researcher: {
    name: string;
    email: string;
  };
  program: {
    title: string;
  };
}

interface ReportManagementProps {
  isCompany: boolean;
}

export default function ReportManagement({ isCompany }: ReportManagementProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    if (isCompany) {
      fetchReports();
    }
  }, [isCompany]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/reports');
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, status: string, comment?: string) => {
    setStatusLoading(true);
    try {
      const response = await fetch(`/api/reports/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, comment }),
      });

      if (response.ok) {
        await fetchReports(); // Refresh the reports list
        setShowStatusModal(false);
        setSelectedReport(null);
        alert('Report status updated successfully!');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update report status');
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
      alert('Failed to update report status');
    } finally {
      setStatusLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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

  if (!isCompany) {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded animate-pulse"></div>
          <div className="text-lg font-semibold text-gray-900">Loading reports...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Submitted Reports ({reports.length})
          </h3>
          <div className="flex items-center text-sm text-gray-500">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Security reports from researchers
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No reports yet</h4>
            <p className="text-gray-500">Reports will appear here when researchers submit them</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{report.title}</h4>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>by {report.researcher.name}</span>
                      <span>•</span>
                      <span>{report.program.title}</span>
                      <span>•</span>
                      <span>{formatDate(report.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    {report.status === 'Submitted' && (
                      <button
                        onClick={() => {
                          setSelectedReport(report);
                          setShowStatusModal(true);
                        }}
                        className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md transition-colors"
                      >
                        Review
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span className="ml-2 text-gray-600">{report.vulnerabilityType}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Researcher:</span>
                      <span className="ml-2 text-gray-600">{report.researcher.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Review Report</h2>
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedReport(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedReport.title}</h3>
                <div className="flex space-x-2 mb-3">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    {selectedReport.vulnerabilityType}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{selectedReport.description}</p>
                <div className="text-sm text-gray-500">
                  Submitted by {selectedReport.researcher.name} on {formatDate(selectedReport.createdAt)}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'InReview')}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark In Review
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'Validated')}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Validate
                </button>
                <button
                  onClick={() => updateReportStatus(selectedReport.id, 'Rejected')}
                  disabled={statusLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}