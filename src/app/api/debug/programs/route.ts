import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const programs = await prisma.program.findMany({
      select: {
        id: true,
        title: true,
        githubRepo: true,
        githubIssues: true,
        maintainerEmail: true,
        codeLanguages: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      programs,
      count: programs.length,
    });
  } catch (error) {
    console.error('Debug query error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}