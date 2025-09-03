// src/app/api/reports/[id]/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { NotificationService } from '@/lib/notifications';

export async function PATCH(
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

    // Check if user exists and is a company
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== 'Company') {
      return NextResponse.json({ error: 'Only companies can update report status' }, { status: 403 });
    }

    const body = await request.json();
    const { status, comment } = body;

    // Validate status
    const validStatuses = ['InReview', 'Validated', 'Rejected', 'Fixed', 'Disclosed'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Get the report and verify ownership
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            title: true,
            companyId: true,
            rewards: true,
          },
        },
        researcher: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    if (report.program.companyId !== userId) {
      return NextResponse.json({ error: 'You can only update reports for your own programs' }, { status: 403 });
    }

    // Update report status
    const updatedReport = await prisma.report.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        program: {
          select: {
            title: true,
            rewards: true,
          },
        },
        researcher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Create reward if report is validated
    if (status === 'Validated' && !report.reward) {
      try {
        const programRewards = report.program.rewards as any;
        const rewardAmount = programRewards[report.severity.toLowerCase()] || 0;

        if (rewardAmount > 0) {
          await prisma.reward.create({
            data: {
              amount: rewardAmount,
              currency: 'USD',
              status: 'Pending',
              reportId: report.id,
              researcherId: report.researcher.id,
            },
          });

          // Update researcher XP
          const xpGain = getXPForSeverity(report.severity);
          await prisma.user.update({
            where: { id: report.researcher.id },
            data: {
              xp: {
                increment: xpGain,
              },
            },
          });
        }
      } catch (error) {
        console.error('Failed to create reward:', error);
      }
    }

    // Notify the researcher about status change
    try {
      let message = '';
      let notificationType: 'ReportUpdate' | 'Reward' = 'ReportUpdate';

      switch (status) {
        case 'InReview':
          message = `Your report "${report.title}" is now under review by ${user.name}`;
          break;
        case 'Validated':
          message = `Great news! Your report "${report.title}" has been validated by ${user.name}`;
          notificationType = 'Reward';
          break;
        case 'Rejected':
          message = `Your report "${report.title}" has been rejected by ${user.name}${comment ? `: ${comment}` : ''}`;
          break;
        case 'Fixed':
          message = `Your report "${report.title}" has been fixed by ${user.name}`;
          break;
        case 'Disclosed':
          message = `Your report "${report.title}" has been publicly disclosed`;
          break;
      }

      await NotificationService.createNotification(
        report.researcher.id,
        message,
        notificationType
      );
    } catch (error) {
      console.error('Failed to notify researcher of status change:', error);
    }

    return NextResponse.json({
      message: 'Report status updated successfully',
      report: updatedReport,
    });

  } catch (error) {
    console.error('Update report status error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to calculate XP based on severity
function getXPForSeverity(severity: string): number {
  switch (severity) {
    case 'Critical':
      return 500;
    case 'High':
      return 300;
    case 'Medium':
      return 150;
    case 'Low':
      return 50;
    default:
      return 25;
  }
}