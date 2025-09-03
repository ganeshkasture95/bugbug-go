// src/components/CreateProgramModal.tsx
'use client';

import { useState } from 'react';

interface CreateProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programData: any) => void;
  loading?: boolean;
}

export default function CreateProgramModal({
  isOpen,
  onClose,
  onSubmit,
  loading = false
}: CreateProgramModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scope: [''],
    rewards: {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    },
    githubRepo: '',
    githubIssues: [''],
    maintainerEmail: '',
    codeLanguages: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    const validScope = formData.scope.filter(item => item.trim());
    if (validScope.length === 0) {
      newErrors.scope = 'At least one scope item is required';
    }

    // Validate GitHub repo format if provided
    if (formData.githubRepo && !formData.githubRepo.match(/^[\w\-\.]+\/[\w\-\.]+$/)) {
      newErrors.githubRepo = 'GitHub repository should be in format "owner/repo"';
    }

    // Validate maintainer email if provided
    if (formData.maintainerEmail && !formData.maintainerEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.maintainerEmail = 'Please enter a valid email address';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit({
      ...formData,
      scope: validScope,
      githubIssues: formData.githubIssues.filter(item => item.trim()),
      codeLanguages: formData.codeLanguages.filter(item => item.trim()),
    });
  };

  const handleScopeChange = (index: number, value: string) => {
    const newScope = [...formData.scope];
    newScope[index] = value;
    setFormData({ ...formData, scope: newScope });
  };

  const addScopeItem = () => {
    setFormData({ ...formData, scope: [...formData.scope, ''] });
  };

  const removeScopeItem = (index: number) => {
    const newScope = formData.scope.filter((_, i) => i !== index);
    setFormData({ ...formData, scope: newScope });
  };

  const handleRewardChange = (severity: keyof typeof formData.rewards, value: string) => {
    const numValue = parseFloat(value) || 0;
    setFormData({
      ...formData,
      rewards: {
        ...formData.rewards,
        [severity]: numValue,
      },
    });
  };

  const handleGithubIssueChange = (index: number, value: string) => {
    const newIssues = [...formData.githubIssues];
    newIssues[index] = value;
    setFormData({ ...formData, githubIssues: newIssues });
  };

  // Auto-format GitHub issue URLs
  const formatGithubIssue = (issue: string, repoUrl: string) => {
    if (!issue.trim()) return issue;

    // If it's just a number, format as #number
    if (/^\d+$/.test(issue.trim())) {
      return `#${issue.trim()}`;
    }

    // If it's #number and we have a repo, convert to full URL
    if (/^#\d+$/.test(issue.trim()) && repoUrl) {
      return `https://github.com/${repoUrl}/issues/${issue.slice(1)}`;
    }

    return issue;
  };

  const validateGithubIssue = (issue: string) => {
    if (!issue.trim()) return true;

    // Allow issue numbers (#123), full URLs, or plain numbers
    const patterns = [
      /^\d+$/,  // Plain number
      /^#\d+$/, // #number format
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/issues\/\d+$/ // Full URL
    ];

    return patterns.some(pattern => pattern.test(issue.trim()));
  };

  const addGithubIssue = () => {
    setFormData({ ...formData, githubIssues: [...formData.githubIssues, ''] });
  };

  const removeGithubIssue = (index: number) => {
    const newIssues = formData.githubIssues.filter((_, i) => i !== index);
    setFormData({ ...formData, githubIssues: newIssues });
  };

  const handleCodeLanguageChange = (index: number, value: string) => {
    const newLanguages = [...formData.codeLanguages];
    newLanguages[index] = value;
    setFormData({ ...formData, codeLanguages: newLanguages });
  };

  const addCodeLanguage = () => {
    setFormData({ ...formData, codeLanguages: [...formData.codeLanguages, ''] });
  };

  const removeCodeLanguage = (index: number) => {
    const newLanguages = formData.codeLanguages.filter((_, i) => i !== index);
    setFormData({ ...formData, codeLanguages: newLanguages });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
      <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Create Bug Bounty Program</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-red-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="form-label">
                Program Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder="e.g., Web Application Security Program"
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="form-label">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="form-input form-textarea"
                placeholder="Describe your bug bounty program, what you're looking for, and any specific guidelines..."
              />
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            {/* Scope */}
            <div>
              <label className="form-label">
                Scope *
              </label>
              {formData.scope.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleScopeChange(index, e.target.value)}
                    className="form-input flex-1"
                    placeholder="e.g., *.example.com, mobile app, API endpoints"
                  />
                  {formData.scope.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScopeItem(index)}
                      className="btn-ghost text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addScopeItem}
                className="text-red-600 hover:text-red-800 text-sm font-medium"
              >
                + Add Scope Item
              </button>
              {errors.scope && <p className="form-error">{errors.scope}</p>}
            </div>

            {/* GitHub Integration */}
            <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-lg font-medium mb-4" style={{ color: 'var(--foreground)' }}>GitHub Integration (Optional)</h3>

              {/* GitHub Repository */}
              <div className="mb-4">
                <label className="form-label">
                  GitHub Repository
                </label>
                <input
                  type="text"
                  value={formData.githubRepo}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  className="form-input"
                  placeholder="e.g., facebook/react or microsoft/vscode"
                />
                {errors.githubRepo && <p className="form-error">{errors.githubRepo}</p>}
                <p className="form-help">Format: owner/repository</p>
              </div>

              {/* GitHub Issues */}
              <div className="mb-4">
                <label className="form-label">
                  Related GitHub Issues
                </label>
                <p className="form-help mb-3">
                  Link specific GitHub issues that researchers should focus on. Issues help provide context and direction for security research.
                </p>
                {formData.githubIssues.map((issue, index) => {
                  const isValid = validateGithubIssue(issue);
                  const formattedIssue = formatGithubIssue(issue, formData.githubRepo);

                  return (
                    <div key={index} className="mb-3">
                      <div className="flex gap-2 mb-1">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={issue}
                            onChange={(e) => handleGithubIssueChange(index, e.target.value)}
                            className={`form-input ${issue && !isValid ? 'border-red-300' : ''}`}
                            placeholder="123, #123, or full GitHub issue URL"
                          />
                          {issue && isValid && formattedIssue !== issue && (
                            <div className="absolute right-2 top-2">
                              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {formData.githubIssues.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGithubIssue(index)}
                            className="btn-outline text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Issue Preview */}
                      {issue && isValid && (
                        <div className="ml-1 text-xs text-gray-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                          </svg>
                          {formattedIssue.startsWith('http') ? (
                            <span>Will link to: {formattedIssue}</span>
                          ) : (
                            <span>Issue reference: {formattedIssue}</span>
                          )}
                        </div>
                      )}

                      {issue && !isValid && (
                        <div className="ml-1 text-xs text-red-600 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Invalid format. Use: 123, #123, or full GitHub URL
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addGithubIssue}
                    className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add GitHub Issue
                  </button>

                  {formData.githubRepo && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(`https://github.com/${formData.githubRepo}/issues`, '_blank');
                      }}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Browse Issues
                    </button>
                  )}
                </div>
              </div>

              {/* Maintainer Email */}
              <div className="mb-4">
                <label className="form-label">
                  Maintainer Contact Email
                </label>
                <input
                  type="email"
                  value={formData.maintainerEmail}
                  onChange={(e) => setFormData({ ...formData, maintainerEmail: e.target.value })}
                  className="form-input"
                  placeholder="maintainer@company.com"
                />
                {errors.maintainerEmail && <p className="form-error">{errors.maintainerEmail}</p>}
              </div>

              {/* Code Languages */}
              <div>
                <label className="form-label">
                  Programming Languages
                </label>
                {formData.codeLanguages.map((language, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => handleCodeLanguageChange(index, e.target.value)}
                      className="form-input flex-1"
                      placeholder="e.g., JavaScript, Python, Go"
                    />
                    {formData.codeLanguages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCodeLanguage(index)}
                        className="btn-ghost text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addCodeLanguage}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  + Add Language
                </button>
              </div>
            </div>

            {/* Rewards */}
            <div className="border-t pt-6" style={{ borderColor: 'var(--border)' }}>
              <label className="form-label mb-4">
                Reward Structure (USD)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Low Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.low}
                    onChange={(e) => handleRewardChange('low', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Medium Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.medium}
                    onChange={(e) => handleRewardChange('medium', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>High Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.high}
                    onChange={(e) => handleRewardChange('high', e.target.value)}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>Critical Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.critical}
                    onChange={(e) => handleRewardChange('critical', e.target.value)}
                    className="form-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Program'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}