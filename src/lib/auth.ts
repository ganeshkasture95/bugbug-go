// src/lib/auth.ts
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { prisma } from './prisma';

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private static readonly JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);
    private static readonly JWT_REFRESH_SECRET = new TextEncoder().encode(process.env.JWT_REFRESH_SECRET!);
    private static readonly BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12');

    // Hash password
    static async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, this.BCRYPT_ROUNDS);
    }

    // Verify password
    static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }

    // Generate JWT tokens
    static async generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): Promise<AuthTokens> {
        const accessTokenExpiry = process.env.SESSION_TIMEOUT || '24h';
        const refreshTokenExpiry = process.env.REFRESH_TOKEN_TIMEOUT || '7d';
        
        // Convert expiry strings to seconds
        const accessExpiry = accessTokenExpiry === '24h' ? '24h' : accessTokenExpiry;
        const refreshExpiry = refreshTokenExpiry === '7d' ? '7d' : refreshTokenExpiry;

        const accessToken = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(accessExpiry)
            .sign(this.JWT_SECRET);

        const refreshToken = await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(refreshExpiry)
            .sign(this.JWT_REFRESH_SECRET);

        return { accessToken, refreshToken };
    }

    // Verify access token
    static async verifyAccessToken(token: string): Promise<JWTPayload | null> {
        try {
            console.log('Verifying token with secret:', this.JWT_SECRET ? 'Secret exists' : 'No secret');
            const { payload } = await jwtVerify(token, this.JWT_SECRET);
            console.log('Token verification successful:', payload.userId);
            return payload as JWTPayload;
        } catch (error) {
            console.log('Token verification failed:', error);
            return null;
        }
    }

    // Verify refresh token
    static async verifyRefreshToken(token: string): Promise<JWTPayload | null> {
        try {
            const { payload } = await jwtVerify(token, this.JWT_REFRESH_SECRET);
            return payload as JWTPayload;
        } catch {
            return null;
        }
    }

    // Get user by ID with security checks
    static async getUserById(userId: string) {
        return prisma.user.findUnique({
            where: { id: userId },
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
    }

    // Validate user credentials
    static async validateCredentials(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });

        if (!user) {
            return null;
        }

        const isValidPassword = await this.verifyPassword(password, user.password);
        if (!isValidPassword) {
            return null;
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            twoFactorEnabled: user.twoFactorEnabled,
        };
    }
}