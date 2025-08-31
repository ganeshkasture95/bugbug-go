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
  _count: {
    reports: number;
  };
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
        return 'bg-green-100 text-green-800';
      case 'Paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'Closed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {program.title}
          </h3>
          <p className="text-sm text-gray-600 mb-2">
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
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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

      <p className="text-gray-700 mb-4 line-clamp-3">
        {program.description}
      </p>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Scope:</h4>
        <div className="flex flex-wrap gap-2">
          {program.scope.slice(0, 3).map((item, index) => (
            <span
              key={index}
              className="inline-flex px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              {item}
            </span>
          ))}
          {program.scope.length > 3 && (
            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{program.scope.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Rewards:</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Low:</span>
            <span className="font-medium">{formatCurrency(program.rewards.low)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Medium:</span>
            <span className="font-medium">{formatCurrency(program.rewards.medium)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">High:</span>
            <span className="font-medium">{formatCurrency(program.rewards.high)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Critical:</span>
            <span className="font-medium text-red-600">{formatCurrency(program.rewards.critical)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-500">
          {program._count.reports} reports submitted
        </div>
        <button
          onClick={() => onViewDetails?.(program.id)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  );
}