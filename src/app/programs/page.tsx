// src/app/programs/page.tsx
import { getServerUser } from '@/lib/server-auth';
import { getServerPrograms } from '@/lib/server-programs';
import { redirect } from 'next/navigation';
import ProgramsClient from './ProgramsClient';

export default async function ProgramsPage() {
  const user = await getServerUser();
  
  if (!user) {
    redirect('/login');
  }

  // Fetch programs data in parallel
  const programs = await getServerPrograms(user.id, user.role);

  return <ProgramsClient user={user} initialPrograms={programs} />;
}