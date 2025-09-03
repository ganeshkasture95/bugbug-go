import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Add GitHub fields to Program table
    await prisma.$executeRaw`
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "githubRepo" TEXT;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "githubIssues" TEXT[] DEFAULT '{}';
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "maintainerEmail" TEXT;
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "codeLanguages" TEXT[] DEFAULT '{}';
    `;

    return NextResponse.json({
      success: true,
      message: 'GitHub fields added successfully'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}