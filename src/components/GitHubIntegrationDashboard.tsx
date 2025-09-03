'use client';

import { useState, useEffect } from 'react';
import GitHubIssueCard from './GitHubIssueCard';
import GitHubIssuesManager from './GitHubIssuesManager';

interface GitHubRepository {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stargazers_count: number;
  open_issues_count: number;
  html_url: string;
}

interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{
    name: string;
    color: string;
  }>;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  html_url: string;
}

interface GitHubIntegrationDashboardProps {
  programId: string;
  githubRepo?: string;
  currentIssues: string[];
  onUpdate: () => void;
}

export default function GitHubIntegrationDashboard({
  programId,
  githubRepo,
  currentIssues,
  onUpdate,
}: GitHubIntegrationDashboardProps) {
  const [repository, setRepository] = useState<GitHubRepository | null>(null);
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'manage'>('overview');

  const fetchGitHubData = async () => {
    if (!githubRepo) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/programs/${programId}/github-sync`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch GitHub data');
      }

      setRepository(data.repository);
      setIssues(data.issues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  const handleIssuesUpdate = async (updatedIssues: string[]) => {
    try {
      const response = await fetch(`/api/programs/${programId}/github-sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update-issues',
          issues: updatedIssues,
        }),
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to update issues:', error);
    }
  };

  useEffect(() => {
    if (githubRepo) {
      fetchGitHubData();
    }
  }, [githubRepo, programId]);

  if (!githubRepo) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No GitHub Repository Linked
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Connect a GitHub repository to enable issue tracking and enhanced collaboration
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Edit your program to add a GitHub repository
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <svg className="w-8 h-8 text-gray-900 dark:text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                GitHub Integration
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {githubRepo}
              </p>
            </div>
          </div>
          <button
            onClick={fetchGitHubData}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md disabled:opacity-50"
          >
            <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {loading ? 'Syncing...' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'issues', label: 'Repository Issues', icon: '🐛' },
            { id: 'manage', label: 'Manage Links', icon: '⚙️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 dark:text-red-200">{error}</span>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-6">
            {repository && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {repository.stargazers_count.toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Stars</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {repository.open_issues_count}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Open Issues</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {currentIssues.length}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Linked Issues</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center">
                    <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {repository.language || 'Mixed'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Primary Language</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {repository?.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Repository Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{repository.description}</p>
              </div>
            )}

            <div className="flex justify-center">
              <a
                href={repository?.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-gray-900 dark:bg-gray-700 text-white rounded-md hover:bg-gray-800 dark:hover:bg-gray-600"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                View on GitHub
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading repository issues...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No open issues found in repository</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {issues.map((issue) => (
                  <GitHubIssueCard
                    key={issue.id}
                    issueUrl={issue.html_url}
                    repoUrl={githubRepo}
                    compact={false}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'manage' && (
          <GitHubIssuesManager
            programId={programId}
            githubRepo={githubRepo}
            currentIssues={currentIssues}
            onIssuesUpdate={handleIssuesUpdate}
          />
        )}
      </div>
    </div>
  );
}