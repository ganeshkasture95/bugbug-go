// src/components/LoadingSkeleton.tsx
export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      {/* Navigation Skeleton */}
      <nav className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <div className="w-64 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="w-20 h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="w-12 h-8 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Cards Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-200 rounded-xl p-8 animate-pulse">
              <div className="w-48 h-6 bg-gray-300 rounded mb-4"></div>
              <div className="w-full h-4 bg-gray-300 rounded mb-6"></div>
              <div className="w-32 h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
            <div className="w-24 h-6 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export function ProgramsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-slate-50">
      {/* Navigation Skeleton */}
      <nav className="relative z-10 px-6 py-4 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-24 h-6 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <div className="w-48 h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="w-96 h-4 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="w-32 h-10 bg-gray-200 rounded animate-pulse mt-4 sm:mt-0"></div>
        </div>

        {/* Programs Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
              <div className="w-full h-6 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="w-full h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="w-3/4 h-4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex flex-wrap gap-2 mb-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-16 h-6 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-16 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
