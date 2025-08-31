// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    let userId = request.headers.get('x-user-id');
    
    // If no user ID from middleware, try to get it from the token directly
    if (!userId) {
      const token = request.cookies.get('accessToken')?.value;
      console.log('Profile API: No x-user-id header, checking token:', !!token);
      
      if (!token) {
        console.log('Profile API: No token found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const payload = await AuthService.verifyAccessToken(token);
      if (!payload) {
        console.log('Profile API: Token verification failed');
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }
      
      userId = payload.userId;
      console.log('Profile API: Got user ID from token:', userId);
    }

    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      console.log('Profile API: User not found:', userId);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('Profile API: Returning user data for:', user.email);
    return NextResponse.json(user);

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}