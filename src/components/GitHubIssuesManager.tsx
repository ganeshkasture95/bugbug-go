'use client';

import { useState, useEffect } from 'react';
import GitHubIssueCard from './GitHubIssueCard';

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

interface GitHubIssuesManagerProps {
  programId: string;
  githubRepo?: string;
  currentIssues: string[];
  onIssuesUpdate: (issues: string[]) => void;
}

export default function GitHubIssuesManager({ 
  programId, 
  githubRepo, 
  currentIssues, 
  onIssuesUpdate 
}: GitHubIssuesManagerProps) {
  const [issues, setIssues] = useState<string[]>(currentIssues);
  const [newIssue, setNewIssue] = useState('');
  const [repoIssues, setRepoIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch issues from GitHub repository
  const fetchRepoIssues = async () => {
    if (!githubRepo) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/issues?state=open&per_page=20`);
      if (response.ok) {
        const data = await response.json();
        setRepoIssues(data);
      }
    } catch (error) {
      console.error('Failed to fetch repository issues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showSuggestions && githubRepo) {
      fetchRepoIssues();
    }
  }, [showSuggestions, githubRepo]);

  const addIssue = (issueRef: string) => {
    if (!issueRef.trim() || issues.includes(issueRef)) return;
    
    const updatedIssues = [...issues, issueRef];
    setIssues(updatedIssues);
    onIssuesUpdate(updatedIssues);
    setNewIssue('');
  };

  const removeIssue = (issueRef: string) => {
    const updatedIssues = issues.filter(issue => issue !== issueRef);
    setIssues(updatedIssues);
    onIssuesUpdate(updatedIssues);
  };

  const addSuggestedIssue = (issue: GitHubIssue) => {
    const issueUrl = issue.html_url;
    addIssue(issueUrl);
    setShowSuggestions(false);
  };

  const validateIssueFormat = (issue: string) => {
    if (!issue.trim()) return true;
    
    const patterns = [
      /^\d+$/,  // Plain number
      /^#\d+$/, // #number format
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/issues\/\d+$/ // Full URL
    ];
    
    return patterns.some(pattern => pattern.test(issue.trim()));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          GitHub Issues Management
        </h3>
        {githubRepo && (
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showSuggestions ? 'Hide' : 'Show'} Repository Issues
          </button>
        )}
      </div>

      {/* Add New Issue */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newIssue}
          onChange={(e) => setNewIssue(e.target.value)}
          placeholder="Add issue: 123, #123, or full GitHub URL"
          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
            newIssue && !validateIssueFormat(newIssue)
              ? 'border-red-300 focus:ring-red-500'
              : 'border-gray-300 focus:ring-blue-500'
          }`}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && validateIssueFormat(newIssue)) {
              addIssue(newIssue);
            }
          }}
        />
        <button
          onClick={() => addIssue(newIssue)}
          disabled={!newIssue.trim() || !validateIssueFormat(newIssue)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add
        </button>
      </div>

      {newIssue && !validateIssueFormat(newIssue) && (
        <p className="text-sm text-red-600">
          Invalid format. Use: 123, #123, or full GitHub URL
        </p>
      )}

      {/* Current Issues */}
      {issues.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            Linked Issues ({issues.length})
          </h4>
          {issues.map((issue, index) => (
            <div key={index} className="relative">
              <GitHubIssueCard
                issueUrl={issue}
                repoUrl={githubRepo}
                compact={true}
              />
              <button
                onClick={() => removeIssue(issue)}
                className="absolute top-2 right-2 p-1 text-red-600 hover:text-red-800 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
                title="Remove issue"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Repository Issues Suggestions */}
      {showSuggestions && githubRepo && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Repository Issues ({githubRepo})
          </h4>
          
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Loading issues...</p>
            </div>
          ) : repoIssues.length === 0 ? (
            <p className="text-sm text-gray-500">No open issues found in repository</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {repoIssues
                .filter(issue => !issues.includes(issue.html_url))
                .map((issue) => (
                  <div key={issue.id} className="relative">
                    <GitHubIssueCard
                      issueUrl={issue.html_url}
                      repoUrl={githubRepo}
                      compact={true}
                    />
                    <button
                      onClick={() => addSuggestedIssue(issue)}
                      className="absolute top-2 right-2 p-1 text-green-600 hover:text-green-800 bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-600"
                      title="Add to program"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {issues.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No GitHub issues linked yet</p>
          <p className="text-xs mt-1">Add issues to help researchers focus their efforts</p>
        </div>
      )}
    </div>
  );
}