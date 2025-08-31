// src/app/api/auth/logout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value;
    const refreshToken = request.cookies.get('refreshToken')?.value;

    // Delete session from database
    if (accessToken) {
      await prisma.session.deleteMany({
        where: {
          OR: [
            { token: accessToken },
            { refreshToken: refreshToken || '' },
          ],
        },
      });
    }

    // Log logout
    const userId = request.headers.get('x-user-id');
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'LOGOUT',
          ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    }

    // Clear cookies
    const response = NextResponse.json({ message: 'Logout successful' });
    
    response.cookies.delete('accessToken');
    response.cookies.delete('refreshToken');

    return response;

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}