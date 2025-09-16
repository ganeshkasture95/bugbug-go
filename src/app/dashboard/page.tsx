// src/app/dashboard/page.tsx
import { getServerDashboardStats, getServerUser } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const user = await getServerUser();
    
    if (!user) {
        redirect('/login');
    }

    // Fetch dashboard stats in parallel
    const stats = await getServerDashboardStats(user.id);

    return <DashboardClient user={user} stats={stats} />;
}