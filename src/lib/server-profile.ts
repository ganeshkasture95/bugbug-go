// src/lib/server-profile.ts
import { prisma } from './prisma';

export async function getServerUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
          orderBy: { createdAt: 'desc' },
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
              include: {
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
          orderBy: { createdAt: 'desc' },
        },
        rewards: {
          where: {
            status: 'Paid',
          },
          select: {
            amount: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate statistics
    const stats = {
      totalReports: user.reports.length,
      totalPrograms: user.programs.length,
      totalEarnings: user.rewards.reduce((sum, reward) => sum + reward.amount, 0),
      totalXP: user.xp,
    };

    // Calculate severity breakdown
    const severityBreakdown = user.reports.reduce((acc, report) => {
      acc[report.severity] = (acc[report.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate program statistics for companies
    const programStats = user.programs.reduce((acc, program) => {
      acc.totalPrograms = (acc.totalPrograms || 0) + 1;
      acc.totalReports = (acc.totalReports || 0) + program.reports.length;
      acc.totalResearchers = (acc.totalResearchers || 0) + program.enrollments.length;
      return acc;
    }, {} as Record<string, number>);

    // Remove sensitive fields
    const { 
      password, 
      twoFactorSecret, 
      emailVerificationToken, 
      passwordResetToken,
      ...safeUser 
    } = user;

    return {
      ...safeUser,
      stats,
      severityBreakdown,
      programStats,
    };
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}
