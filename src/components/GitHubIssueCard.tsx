'use client';

import { useState, useEffect } from 'react';

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

interface GitHubIssueCardProps {
  issueUrl: string;
  repoUrl?: string;
  compact?: boolean;
}

export default function GitHubIssueCard({ issueUrl, repoUrl, compact = false }: GitHubIssueCardProps) {
  const [issue, setIssue] = useState<GitHubIssue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract owner, repo, and issue number from URL or reference
  const parseIssueReference = (ref: string, repo?: string) => {
    // Full GitHub URL
    const urlMatch = ref.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
    if (urlMatch) {
      return {
        owner: urlMatch[1],
        repo: urlMatch[2],
        issueNumber: parseInt(urlMatch[3])
      };
    }

    // Issue number with repo context
    const numberMatch = ref.match(/^#?(\d+)$/);
    if (numberMatch && repo) {
      const [owner, repoName] = repo.split('/');
      return {
        owner,
        repo: repoName,
        issueNumber: parseInt(numberMatch[1])
      };
    }

    return null;
  };

  useEffect(() => {
    const fetchIssue = async () => {
      const parsed = parseIssueReference(issueUrl, repoUrl);
      if (!parsed) {
        setError('Invalid issue reference');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/issues/${parsed.issueNumber}`
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const issueData = await response.json();
        setIssue(issueData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch issue');
      } finally {
        setLoading(false);
      }
    };

    fetchIssue();
  }, [issueUrl, repoUrl]);

  if (loading) {
    return (
      <div className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${compact ? 'bg-gray-50 dark:bg-gray-800' : 'bg-white dark:bg-gray-800'}`}>
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className={`border border-red-200 dark:border-red-800 rounded-lg p-4 ${compact ? 'bg-red-50 dark:bg-red-900/20' : 'bg-white dark:bg-gray-800'}`}>
        <div className="flex items-center text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{error || 'Issue not found'}</span>
        </div>
      </div>
    );
  }

  const getStateColor = (state: string) => {
    return state === 'open' 
      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
  };

  const getLabelColor = (color: string) => {
    return {
      backgroundColor: `#${color}`,
      color: parseInt(color, 16) > 0xffffff / 2 ? '#000' : '#fff'
    };
  };

  if (compact) {
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateColor(issue.state)}`}>
                {issue.state}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                #{issue.number}
              </span>
            </div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {issue.title}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              by {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
            </p>
          </div>
          <a
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={issue.user.avatar_url}
            alt={issue.user.login}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStateColor(issue.state)}`}>
                {issue.state}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                #{issue.number}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              by {issue.user.login} • {new Date(issue.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <a
          href={issue.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {issue.title}
      </h3>

      {issue.body && (
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-3 line-clamp-3">
          {issue.body.substring(0, 200)}
          {issue.body.length > 200 && '...'}
        </div>
      )}

      {issue.labels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {issue.labels.slice(0, 5).map((label) => (
            <span
              key={label.name}
              className="inline-flex px-2 py-1 text-xs font-medium rounded-full"
              style={getLabelColor(label.color)}
            >
              {label.name}
            </span>
          ))}
          {issue.labels.length > 5 && (
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              +{issue.labels.length - 5} more
            </span>
          )}
        </div>
      )}
    </div>
  );
}