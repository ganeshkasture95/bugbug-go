// src/lib/server-programs.ts
import { prisma } from './prisma';

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

export async function getServerProgram(programId: string) {
  try {
    return await prisma.program.findUnique({
      where: { id: programId },
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
      }
    });
  } catch (error) {
    console.error('Failed to fetch program:', error);
    return null;
  }
}

export async function checkEnrollmentStatus(userId: string, programId: string) {
  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId
        }
      }
    });
    return !!enrollment;
  } catch (error) {
    console.error('Failed to check enrollment status:', error);
    return false;
  }
}
