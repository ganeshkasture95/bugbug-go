// src/app/api/auth/2fa/setup/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TwoFactorService } from '@/lib/twoFactor';
import { twoFactorSetupSchema } from '@/lib/validations';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, twoFactorEnabled: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: '2FA is already enabled' },
        { status: 400 }
      );
    }

    // Generate secret
    const secret = TwoFactorService.generateSecret(user.email);
    
    // Generate QR code
    const qrCode = await TwoFactorService.generateQRCode(secret.otpauth_url!);

    // Store secret temporarily (you might want to encrypt this)
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorSecret: secret.base32 },
    });

    return NextResponse.json({
      secret: secret.base32,
      qrCode,
      manualEntryKey: secret.base32,
    });

  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token } = twoFactorSetupSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json(
        { error: 'No 2FA setup in progress' },
        { status: 400 }
      );
    }

    // Verify the token
    const isValid = TwoFactorService.verifyToken(user.twoFactorSecret, token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid 2FA code' },
        { status: 400 }
      );
    }

    // Enable 2FA
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true },
    });

    // Log 2FA enablement
    await prisma.auditLog.create({
      data: {
        userId,
        action: '2FA_ENABLED',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({ message: '2FA enabled successfully' });

  } catch (error) {
    console.error('2FA enable error:', error);
    
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