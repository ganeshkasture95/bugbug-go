// src/app/api/programs/[id]/researchers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Get user from token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.userId;

    // Check if user exists and has permission to view this program's researchers
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if program exists
    const program = await prisma.program.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        companyId: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Only allow company owners or admins to view enrolled researchers
    if (user.role !== 'Admin' && program.companyId !== userId) {
      return NextResponse.json({ error: 'Forbidden - You can only view researchers for your own programs' }, { status: 403 });
    }

    // Get enrolled researchers
    const enrollments = await prisma.enrollment.findMany({
      where: {
        programId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            xp: true,
            createdAt: true,
            reports: {
              where: {
                programId: id,
              },
              select: {
                id: true,
                title: true,
                severity: true,
                status: true,
                createdAt: true,
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // Format the response
    const researchers = enrollments.map(enrollment => ({
      enrollmentId: enrollment.id,
      enrolledAt: enrollment.enrolledAt,
      researcher: {
        id: enrollment.user.id,
        name: enrollment.user.name,
        email: enrollment.user.email,
        xp: enrollment.user.xp,
        joinedAt: enrollment.user.createdAt,
        reportsCount: enrollment.user.reports.length,
        reports: enrollment.user.reports,
      },
    }));

    return NextResponse.json({
      programId: id,
      programTitle: program.title,
      totalResearchers: researchers.length,
      researchers,
    });

  } catch (error) {
    console.error('Get researchers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}