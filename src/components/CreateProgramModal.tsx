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

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit({
      ...formData,
      scope: validScope,
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create Bug Bounty Program</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Program Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Web Application Security Program"
              />
              {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Describe your bug bounty program, what you're looking for, and any specific guidelines..."
              />
              {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scope *
              </label>
              {formData.scope.map((item, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleScopeChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g., *.example.com, mobile app, API endpoints"
                  />
                  {formData.scope.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeScopeItem(index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addScopeItem}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                + Add Scope Item
              </button>
              {errors.scope && <p className="text-red-600 text-sm mt-1">{errors.scope}</p>}
            </div>

            {/* Rewards */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Reward Structure (USD)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Low Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.low}
                    onChange={(e) => handleRewardChange('low', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Medium Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.medium}
                    onChange={(e) => handleRewardChange('medium', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">High Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.high}
                    onChange={(e) => handleRewardChange('high', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Critical Severity</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.rewards.critical}
                    onChange={(e) => handleRewardChange('critical', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium disabled:opacity-50"
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