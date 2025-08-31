// src/app/api/programs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createProgramSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  scope: z.array(z.string()).min(1, 'At least one scope item is required'),
  rewards: z.object({
    low: z.number().min(0),
    medium: z.number().min(0),
    high: z.number().min(0),
    critical: z.number().min(0),
  }),
});

// GET - Fetch all active programs (for researchers) or company's programs
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let programs;

    if (userRole === 'Company') {
      // Company sees only their programs
      programs = await prisma.program.findMany({
        where: { companyId: userId },
        include: {
          company: {
            select: { name: true, email: true }
          },
          _count: {
            select: { reports: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      // Researchers see all active programs
      programs = await prisma.program.findMany({
        where: { status: 'Active' },
        include: {
          company: {
            select: { name: true, email: true }
          },
          _count: {
            select: { reports: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }

    return NextResponse.json(programs);
  } catch (error) {
    console.error('Programs fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new program (Company only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'Company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = createProgramSchema.parse(body);

    const program = await prisma.program.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        scope: validatedData.scope,
        rewards: validatedData.rewards,
        companyId: userId,
      },
      include: {
        company: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Program creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}