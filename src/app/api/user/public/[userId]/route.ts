// src/app/api/user/public/[userId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    // Verify the requesting user is authenticated
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get public profile data (limited information)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        xp: true,
        createdAt: true,
        badges: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
          },
        },
        reports: {
          where: {
            status: 'Validated', // Only show validated reports for privacy
          },
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
            program: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Limit to recent reports
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate public stats
    const totalReports = await prisma.report.count({
      where: { researcherId: userId },
    });

    const validatedReports = user.reports.length;

    const stats = {
      totalReports,
      validatedReports,
      rank: calculateUserRank(user.xp),
    };

    return NextResponse.json({
      ...user,
      stats,
      recentReports: user.reports,
    });

  } catch (error) {
    console.error('Get public profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate user rank based on XP
function calculateUserRank(xp: number): string {
  if (xp >= 10000) return 'Legend';
  if (xp >= 5000) return 'Expert';
  if (xp >= 2000) return 'Advanced';
  if (xp >= 500) return 'Intermediate';
  if (xp >= 100) return 'Beginner';
  return 'Newcomer';
}