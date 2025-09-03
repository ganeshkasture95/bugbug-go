// src/app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function POST(request: NextRequest) {
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
    const userId = decoded.userId;

    // Check if user exists and is a researcher
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'Researcher') {
      return NextResponse.json({ error: 'Only researchers can submit reports' }, { status: 403 });
    }

    const body = await request.json();
    const { programId, title, description, severity, vulnerabilityType, stepsToReproduce, impact, proofOfConcept } = body;

    // Validate required fields
    if (!programId || !title || !description || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if program exists and is active
    const program = await prisma.program.findUnique({
      where: { id: programId },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.status !== 'Active') {
      return NextResponse.json({ error: 'Cannot submit reports to inactive program' }, { status: 400 });
    }

    // Check if user is enrolled in the program
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: userId,
          programId: programId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'Must be enrolled in program to submit reports' }, { status: 403 });
    }

    // Create report
    const report = await prisma.report.create({
      data: {
        title,
        description,
        severity,
        vulnerabilityType: vulnerabilityType || 'Other',
        stepsToReproduce: stepsToReproduce || '',
        impact: impact || '',
        proofOfConcept: proofOfConcept || '',
        status: 'Submitted',
        researcherId: userId,
        programId: programId,
      },
      include: {
        researcher: {
          select: {
            name: true,
            email: true,
          },
        },
        program: {
          select: {
            title: true,
            company: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Notify the company about the new report
    try {
      const message = `New ${severity.toLowerCase()} severity report "${title}" submitted by ${user.name} for program "${report.program.title}"`;
      await NotificationService.createNotification(
        report.program.company.id,
        message,
        'ReportUpdate'
      );
    } catch (error) {
      console.error('Failed to notify company of new report:', error);
      // Don't fail the report submission if notification fails
    }

    return NextResponse.json(report, { status: 201 });

  } catch (error) {
    console.error('Report submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let reports;

    if (user.role === 'Researcher') {
      // Get reports submitted by this researcher
      reports = await prisma.report.findMany({
        where: { researcherId: userId },
        include: {
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
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'Company') {
      // Get reports for programs owned by this company
      reports = await prisma.report.findMany({
        where: {
          program: {
            companyId: userId,
          },
        },
        include: {
          researcher: {
            select: {
              name: true,
              email: true,
            },
          },
          program: {
            select: {
              title: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      return NextResponse.json({ error: 'Invalid user role' }, { status: 403 });
    }

    return NextResponse.json(reports);

  } catch (error) {
    console.error('Get reports error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}