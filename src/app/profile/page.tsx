// src/app/profile/page.tsx
import { getServerUser } from '@/lib/server-auth';
import { getServerUserProfile } from '@/lib/server-profile';
import { redirect } from 'next/navigation';
import ProfileClient from './ProfileClient';

export default async function ProfilePage() {
  try {
    const user = await getServerUser();
    
    if (!user) {
      redirect('/login');
    }

    // Fetch complete profile data on the server
    const profileData = await getServerUserProfile(user.id);
    console.log('Profile data fetched:', !!profileData);

    if (!profileData) {
      console.error('No profile data found for user:', user.id);
      redirect('/login');
    }

    return <ProfileClient profileData={profileData} />;
  } catch (error) {
    console.error('Error in ProfilePage:', error);
    redirect('/login');
  }
}
