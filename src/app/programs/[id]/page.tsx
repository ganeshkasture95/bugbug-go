// src/app/programs/[id]/page.tsx
import { getServerUser } from '@/lib/server-auth';
import { checkEnrollmentStatus, getServerProgram } from '@/lib/server-programs';
import { redirect } from 'next/navigation';
import ProgramDetailClient from './ProgramDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: PageProps) {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  
  // Fetch program data and enrollment status in parallel
  const [program, enrolled] = await Promise.all([
    getServerProgram(id),
    user.role === 'Researcher' ? checkEnrollmentStatus(user.id, id) : Promise.resolve(false)
  ]);

  if (!program) {
    redirect('/programs');
  }

  return (
    <ProgramDetailClient 
      user={user} 
      program={program} 
      initialEnrolled={enrolled}
    />
  );
}