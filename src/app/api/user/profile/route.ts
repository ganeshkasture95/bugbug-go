// src/app/api/user/profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user profile with related data
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        badges: true,
        reports: {
          include: {
            program: {
              select: {
                id: true,
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
        },
        programs: {
          include: {
            reports: {
              select: {
                id: true,
                severity: true,
                status: true,
              },
            },
            enrollments: {
              select: {
                id: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        enrollments: {
          include: {
            program: {
              select: {
                id: true,
                title: true,
                status: true,
                company: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            enrolledAt: 'desc',
          },
        },
        rewards: {
          include: {
            report: {
              select: {
                id: true,
                title: true,
                severity: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate statistics
    const stats = {
      totalReports: user.reports.length,
      validatedReports: user.reports.filter((r: any) => r.status === 'Validated').length,
      totalEarnings: user.rewards.reduce((sum: number, reward: any) => sum + reward.amount, 0),
      averageResponseTime: '2.5 days', // This would be calculated from actual data
      rank: calculateUserRank(user.xp), // Helper function to calculate rank
    };

    // Calculate severity breakdown for researcher
    const severityBreakdown = user.reports.reduce((acc: Record<string, number>, report: any) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate program statistics for company
    const programStats = user.programs.reduce((acc: Record<string, number>, program: any) => {
      acc.totalPrograms = (acc.totalPrograms || 0) + 1;
      acc.totalReports = (acc.totalReports || 0) + program.reports.length;
      acc.totalResearchers = (acc.totalResearchers || 0) + program.enrollments.length;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      ...user,
      password: undefined, // Remove password from response
      twoFactorSecret: undefined, // Remove sensitive fields
      emailVerificationToken: undefined,
      passwordResetToken: undefined,
      stats,
      severityBreakdown,
      programStats,
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Get user from token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, bio, website, twitter, linkedin, github } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name || undefined,
        bio: bio || null,
        website: website || null,
        twitter: twitter || null,
        linkedin: linkedin || null,
        github: github || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        xp: true,
        bio: true,
        website: true,
        twitter: true,
        linkedin: true,
        github: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });

  } catch (error) {
    console.error('Update profile error:', error);
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