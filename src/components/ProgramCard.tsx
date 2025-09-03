// src/components/ProgramCard.tsx
'use client';

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
  company: {
    name: string;
    email: string;
  };
  _count?: {
    reports: number;
  };
  githubRepo?: string;
  githubIssues?: string[];
  maintainerEmail?: string;
  codeLanguages?: string[];
  createdAt: string;
}

interface ProgramCardProps {
  program: Program;
  userRole: string;
  onEdit?: (program: Program) => void;
  onDelete?: (programId: string) => void;
  onViewDetails?: (programId: string) => void;
}

export default function ProgramCard({ 
  program, 
  userRole, 
  onEdit, 
  onDelete, 
  onViewDetails 
}: ProgramCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active':
        return 'status-active';
      case 'Paused':
        return 'status-paused';
      case 'Closed':
        return 'status-closed';
      default:
        return 'status-closed';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="card p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--card-foreground)' }}>
            {program.title}
          </h3>
          <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
            by {program.company.name}
          </p>
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(program.status)}`}>
            {program.status}
          </span>
        </div>
        
        {userRole === 'Company' && (
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit?.(program)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete?.(program.id)}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="mb-4 line-clamp-3" style={{ color: 'var(--muted-foreground)' }}>
        {program.description}
      </p>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Scope:</h4>
        <div className="flex flex-wrap gap-2">
          {program.scope.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs bg-red-50 text-red-800 rounded-full"
            >
              {item}
            </span>
          ))}
          {program.scope.length > 3 && (
            <span className="inline-flex px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
              +{program.scope.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* GitHub Integration */}
      {(program.githubRepo || program.codeLanguages?.length || program.githubIssues?.length) && (
        <div className="github-section mb-4">
          <h4 className="text-sm font-medium mb-2 flex items-center" style={{ color: 'var(--card-foreground)' }}>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            GitHub Integration
          </h4>
          
          {program.githubRepo && (
            <div className="mb-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Repository:</span>
              <a 
                href={`https://github.com/${program.githubRepo}`}
                target="_blank"
                rel="noopener noreferrer"
                className="github-repo-link ml-2"
              >
                {program.githubRepo}
              </a>
            </div>
          )}
          
          {program.codeLanguages && program.codeLanguages.length > 0 && (
            <div className="mb-2">
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Languages:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {program.codeLanguages.slice(0, 3).map((lang, index) => (
                  <span
                    key={index}
                    className="language-tag"
                  >
                    {lang}
                  </span>
                ))}
                {program.codeLanguages.length > 3 && (
                  <span className="inline-flex px-2 py-1 text-xs rounded-full" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                    +{program.codeLanguages.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
          
          {program.githubIssues && program.githubIssues.length > 0 && (
            <div>
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Related Issues:</span>
              <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {program.githubIssues.length} issue{program.githubIssues.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--card-foreground)' }}>Rewards:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>Low:</span>
            <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(program.rewards.low)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>Medium:</span>
            <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(program.rewards.medium)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>High:</span>
            <span className="font-medium" style={{ color: 'var(--card-foreground)' }}>{formatCurrency(program.rewards.high)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)' }}>Critical:</span>
            <span className="font-medium text-red-600">{formatCurrency(program.rewards.critical)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          {program._count?.reports || 0} reports submitted
        </div>
        <div className="flex gap-2">
          {userRole === 'Company' && (
            <button
              onClick={() => onEdit?.(program)}
              className="btn-secondary"
            >
              Edit
            </button>
          )}
          <button
            onClick={() => onViewDetails?.(program.id)}
            className="btn-primary"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}