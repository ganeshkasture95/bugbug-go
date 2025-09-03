// src/app/(auth)/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Authentication - Bug Bounty Platform',
  description: 'Secure authentication for the bug bounty platform',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {children}
    </div>
  );
}