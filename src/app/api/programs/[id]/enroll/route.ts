// src/app/api/programs/[id]/enroll/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function POST(
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

    // Check if user exists and is a researcher
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'Researcher') {
      return NextResponse.json({ error: 'Only researchers can enroll in programs' }, { status: 403 });
    }

    // Check if program exists and is active
    const program = await prisma.program.findUnique({
      where: { id },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (program.status !== 'Active') {
      return NextResponse.json({ error: 'Cannot enroll in inactive program' }, { status: 400 });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: userId,
          programId: id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'Already enrolled in this program' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        userId: userId,
        programId: id,
        enrolledAt: new Date(),
      },
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
    });

    // Notify the company about the new enrollment
    try {
      await NotificationService.notifyCompanyOfEnrollment(
        id,
        user.name,
        user.email
      );
    } catch (error) {
      console.error('Failed to notify company of enrollment:', error);
      // Don't fail the enrollment if notification fails
    }

    return NextResponse.json({
      message: 'Successfully enrolled in program',
      enrollment,
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Delete enrollment
    const enrollment = await prisma.enrollment.delete({
      where: {
        userId_programId: {
          userId: userId,
          programId: id,
        },
      },
    });

    return NextResponse.json({
      message: 'Successfully unenrolled from program',
    });

  } catch (error: any) {
    console.error('Unenrollment error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Not enrolled in this program' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Check enrollment status
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

    // Check enrollment status
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_programId: {
          userId: userId,
          programId: id,
        },
      },
    });
    
    return NextResponse.json({
      enrolled: !!enrollment,
      enrolledAt: enrollment?.enrolledAt || null,
    });

  } catch (error) {
    console.error('Check enrollment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}