// src/app/api/auth/2fa/disable/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorService } from '@/lib/twoFactor';
import { twoFactorVerifySchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { code } = twoFactorVerifySchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: '2FA is not enabled' },
        { status: 400 }
      );
    }

    // Verify the current 2FA code
    const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, code);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 400 }
      );
    }

    // Disable 2FA
    await TwoFactorService.disable2FA(userId);

    // Log 2FA disablement
    await prisma.auditLog.create({
      data: {
        userId,
        action: '2FA_DISABLED',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ message: '2FA disabled successfully' });

  } catch (error) {
    console.error('2FA disable error:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}