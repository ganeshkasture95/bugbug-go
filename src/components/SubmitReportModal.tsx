// src/components/SubmitReportModal.tsx
'use client';

import { useState } from 'react';

interface SubmitReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportData: any) => void;
  programId: string;
  programTitle: string;
  loading?: boolean;
}

export default function SubmitReportModal({
  isOpen,
  onClose,
  onSubmit,
  programId,
  programTitle,
  loading = false
}: SubmitReportModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'Medium',
    vulnerabilityType: 'Other',
    stepsToReproduce: '',
    impact: '',
    proofOfConcept: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const vulnerabilityTypes = [
    'SQL Injection',
    'Cross-Site Scripting (XSS)',
    'Cross-Site Request Forgery (CSRF)',
    'Authentication Bypass',
    'Authorization Issues',
    'Information Disclosure',
    'Remote Code Execution',
    'Local File Inclusion',
    'Server-Side Request Forgery (SSRF)',
    'Insecure Direct Object Reference',
    'Security Misconfiguration',
    'Cryptographic Issues',
    'Business Logic Flaw',
    'Denial of Service',
    'Other'
  ];

  const severityLevels = [
    { value: 'Low', color: 'text-blue-600', description: 'Minimal impact on security' },
    { value: 'Medium', color: 'text-yellow-600', description: 'Moderate security impact' },
    { value: 'High', color: 'text-orange-600', description: 'Significant security risk' },
    { value: 'Critical', color: 'text-red-600', description: 'Severe security vulnerability' }
  ];

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

    if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.stepsToReproduce.trim()) {
      newErrors.stepsToReproduce = 'Steps to reproduce are required';
    }

    if (!formData.impact.trim()) {
      newErrors.impact = 'Impact description is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Submit the form
    onSubmit({
      ...formData,
      programId,
    });
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      severity: 'Medium',
      vulnerabilityType: 'Other',
      stepsToReproduce: '',
      impact: '',
      proofOfConcept: '',
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center p-4 z-50">
      <div className="modal-content max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Submit Security Report</h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Program: {programTitle}
              </p>
            </div>
            <button
              onClick={handleClose}
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
                Report Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="form-input"
                placeholder="e.g., SQL Injection in User Login Form"
              />
              {errors.title && <p className="form-error">{errors.title}</p>}
            </div>

            {/* Severity and Vulnerability Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="form-label">
                  Severity *
                </label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="form-input form-select"
                >
                  {severityLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.value} - {level.description}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  Vulnerability Type
                </label>
                <select
                  value={formData.vulnerabilityType}
                  onChange={(e) => setFormData({ ...formData, vulnerabilityType: e.target.value })}
                  className="form-input form-select"
                >
                  {vulnerabilityTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="form-label">
                Vulnerability Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="form-input form-textarea"
                placeholder="Provide a detailed description of the vulnerability, including what it affects and how it works..."
              />
              <p className="form-help">
                Minimum 50 characters. Be specific and technical.
              </p>
              {errors.description && <p className="form-error">{errors.description}</p>}
            </div>

            {/* Steps to Reproduce */}
            <div>
              <label className="form-label">
                Steps to Reproduce *
              </label>
              <textarea
                value={formData.stepsToReproduce}
                onChange={(e) => setFormData({ ...formData, stepsToReproduce: e.target.value })}
                rows={6}
                className="form-input form-textarea"
                placeholder="1. Navigate to the login page&#10;2. Enter the following payload in the username field: ' OR 1=1--&#10;3. Click submit&#10;4. Observe that authentication is bypassed"
              />
              <p className="form-help">
                Provide clear, numbered steps that allow the security team to reproduce the issue.
              </p>
              {errors.stepsToReproduce && <p className="form-error">{errors.stepsToReproduce}</p>}
            </div>

            {/* Impact */}
            <div>
              <label className="form-label">
                Impact *
              </label>
              <textarea
                value={formData.impact}
                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                rows={3}
                className="form-input form-textarea"
                placeholder="Describe the potential impact of this vulnerability on the application and its users..."
              />
              <p className="form-help">
                Explain what an attacker could achieve by exploiting this vulnerability.
              </p>
              {errors.impact && <p className="form-error">{errors.impact}</p>}
            </div>

            {/* Proof of Concept */}
            <div>
              <label className="form-label">
                Proof of Concept (Optional)
              </label>
              <textarea
                value={formData.proofOfConcept}
                onChange={(e) => setFormData({ ...formData, proofOfConcept: e.target.value })}
                rows={4}
                className="form-input form-textarea"
                placeholder="Include any code, screenshots, or additional evidence that demonstrates the vulnerability..."
              />
              <p className="form-help">
                Provide any additional evidence, code snippets, or screenshots that support your findings.
              </p>
            </div>

            {/* Severity Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Severity Guidelines</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <div><strong>Critical:</strong> Remote code execution, authentication bypass, data breach</div>
                <div><strong>High:</strong> Privilege escalation, sensitive data exposure, CSRF on critical functions</div>
                <div><strong>Medium:</strong> XSS, information disclosure, business logic flaws</div>
                <div><strong>Low:</strong> Minor information leaks, non-exploitable issues</div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={handleClose}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}