// src/lib/server-auth.ts
import { cookies } from 'next/headers';
import { AuthService } from './auth';
import { prisma } from './prisma';

export async function getServerUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('accessToken')?.value;
    
    if (!token) {
      return null;
    }

    const payload = await AuthService.verifyAccessToken(token);
    if (!payload) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('Server auth error:', error);
    return null;
  }
}

export async function requireAuth() {
  const user = await getServerUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function getServerDashboardStats(userId: string) {
  try {
    const [totalPrograms, activePrograms, totalReports, totalRewards] = await Promise.all([
      prisma.program.count({
        where: { companyId: userId }
      }),
      prisma.program.count({
        where: { 
          companyId: userId,
          status: 'Active'
        }
      }),
      prisma.report.count({
        where: { researcherId: userId }
      }),
      prisma.reward.aggregate({
        where: { 
          researcherId: userId,
          status: 'Paid'
        },
        _sum: { amount: true }
      })
    ]);

    return {
      totalPrograms,
      activePrograms,
      totalReports,
      totalRewards: totalRewards._sum.amount || 0
    };
  } catch (error) {
    console.error('Failed to fetch dashboard stats:', error);
    return {
      totalPrograms: 0,
      activePrograms: 0,
      totalReports: 0,
      totalRewards: 0
    };
  }
}

export async function getServerPrograms(userId: string, userRole: string) {
  try {
    if (userRole === 'Company') {
      // Company sees only their programs
      return await prisma.program.findMany({
        where: { companyId: userId },
        select: {
          id: true,
          title: true,
          description: true,
          scope: true,
          rewards: true,
          status: true,
          githubRepo: true,
          githubIssues: true,
          maintainerEmail: true,
          codeLanguages: true,
          createdAt: true,
          company: {
            select: { name: true, email: true }
          },
          _count: {
            select: { reports: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Researchers see all active programs
      return await prisma.program.findMany({
        where: { status: 'Active' },
        select: {
          id: true,
          title: true,
          description: true,
          scope: true,
          rewards: true,
          status: true,
          githubRepo: true,
          githubIssues: true,
          maintainerEmail: true,
          codeLanguages: true,
          createdAt: true,
          company: {
            select: { name: true, email: true }
          },
          _count: {
            select: { reports: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  } catch (error) {
    console.error('Failed to fetch programs:', error);
    return [];
  }
}
