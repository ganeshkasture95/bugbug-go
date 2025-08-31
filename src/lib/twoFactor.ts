// src/lib/twoFactor.ts
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { prisma } from './prisma';

export class TwoFactorService {
  // Generate 2FA secret for user
  static generateSecret(userEmail: string, appName: string = 'BugBounty Platform') {
    return speakeasy.generateSecret({
      name: userEmail,
      issuer: appName,
      length: 32,
    });
  }

  // Generate QR code for 2FA setup
  static async generateQRCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  // Verify 2FA token
  static verifyToken(secret: string, token: string, window: number = 2): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window,
    });
  }

  // Enable 2FA for user
  static async enable2FA(userId: string, secret: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: true,
          // Store secret securely (you might want to encrypt this)
          twoFactorSecret: secret,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Disable 2FA for user
  static async disable2FA(userId: string): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          twoFactorEnabled: false,
          twoFactorSecret: null,
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  // Get user's 2FA secret
  static async getUserSecret(userId: string): Promise<string | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { twoFactorSecret: true },
    });
    return user?.twoFactorSecret || null;
  }
}