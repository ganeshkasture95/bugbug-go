'use client';

import { useState, useEffect } from 'react';

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
  githubRepo?: string;
  githubIssues?: string[];
  maintainerEmail?: string;
  codeLanguages?: string[];
}

interface EditProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (programData: any) => void;
  program: Program;
  loading?: boolean;
}

export default function EditProgramModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  program,
  loading = false 
}: EditProgramModalProps) {
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
    status: 'Active' as 'Active' | 'Paused' | 'Closed',
    githubRepo: '',
    githubIssues: [''],
    maintainerEmail: '',
    codeLanguages: [''],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when program changes
  useEffect(() => {
    if (program) {
      setFormData({
        title: program.title,
        description: program.description,
        scope: program.scope.length > 0 ? program.scope : [''],
        rewards: program.rewards,
        status: program.status,
        githubRepo: program.githubRepo || '',
        githubIssues: program.githubIssues && program.githubIssues.length > 0 ? program.githubIssues : [''],
        maintainerEmail: program.maintainerEmail || '',
        codeLanguages: program.codeLanguages && program.codeLanguages.length > 0 ? program.codeLanguages : [''],
      });
    }
  }, [program]);

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

  const validateGithubIssue = (issue: string) => {
    if (!issue.trim()) return true;
    
    const patterns = [
      /^\d+$/,  // Plain number
      /^#\d+$/, // #number format
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/issues\/\d+$/ // Full URL
    ];
    
    return patterns.some(pattern => pattern.test(issue.trim()));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Program</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Program Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Web Application Security Program"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Describe your bug bounty program..."
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* GitHub Integration */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">GitHub Integration</h3>
              
              {/* GitHub Repository */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  GitHub Repository
                </label>
                <input
                  type="text"
                  value={formData.githubRepo}
                  onChange={(e) => setFormData({ ...formData, githubRepo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g., facebook/react or microsoft/vscode"
                />
                {errors.githubRepo && <p className="text-red-600 text-sm mt-1">{errors.githubRepo}</p>}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Format: owner/repository</p>
              </div>

              {/* GitHub Issues */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Related GitHub Issues
                </label>
                {formData.githubIssues.map((issue, index) => {
                  const isValid = validateGithubIssue(issue);
                  
                  return (
                    <div key={index} className="mb-3">
                      <div className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={issue}
                          onChange={(e) => handleGithubIssueChange(index, e.target.value)}
                          className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                            issue && !isValid 
                              ? 'border-red-300 focus:ring-red-500' 
                              : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                          }`}
                          placeholder="123, #123, or full GitHub issue URL"
                        />
                        {formData.githubIssues.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeGithubIssue(index)}
                            className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      {issue && !isValid && (
                        <p className="text-xs text-red-600 ml-1">
                          Invalid format. Use: 123, #123, or full GitHub URL
                        </p>
                      )}
                    </div>
                  );
                })}
                <button
                  type="button"
                  onClick={addGithubIssue}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  + Add GitHub Issue
                </button>
              </div>

              {/* Maintainer Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maintainer Contact Email
                </label>
                <input
                  type="email"
                  value={formData.maintainerEmail}
                  onChange={(e) => setFormData({ ...formData, maintainerEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="maintainer@company.com"
                />
                {errors.maintainerEmail && <p className="text-red-600 text-sm mt-1">{errors.maintainerEmail}</p>}
              </div>

              {/* Code Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Programming Languages
                </label>
                {formData.codeLanguages.map((language, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => handleCodeLanguageChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="e.g., JavaScript, Python, Go"
                    />
                    {formData.codeLanguages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCodeLanguage(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
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

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Program'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}