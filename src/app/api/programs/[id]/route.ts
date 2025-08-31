// src/app/api/programs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProgramSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  scope: z.array(z.string()).min(1).optional(),
  rewards: z.object({
    low: z.number().min(0),
    medium: z.number().min(0),
    high: z.number().min(0),
    critical: z.number().min(0),
  }).optional(),
  status: z.enum(['Active', 'Paused', 'Closed']).optional(),
});

// GET - Fetch single program
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const program = await prisma.program.findUnique({
      where: { id: params.id },
      include: {
        company: {
          select: { name: true, email: true }
        },
        reports: {
          select: {
            id: true,
            title: true,
            severity: true,
            status: true,
            createdAt: true,
            researcher: {
              select: { name: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error('Program fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update program (Company only, own programs)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'Company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if program belongs to the company
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
      select: { companyId: true }
    });

    if (!existingProgram || existingProgram.companyId !== userId) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const body = await request.json();
    const validatedData = updateProgramSchema.parse(body);

    const program = await prisma.program.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        company: {
          select: { name: true, email: true }
        }
      }
    });

    return NextResponse.json(program);
  } catch (error) {
    console.error('Program update error:', error);
    
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

// DELETE - Delete program (Company only, own programs)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id');
    const userRole = request.headers.get('x-user-role');

    if (!userId || userRole !== 'Company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Check if program belongs to the company
    const existingProgram = await prisma.program.findUnique({
      where: { id: params.id },
      select: { companyId: true }
    });

    if (!existingProgram || existingProgram.companyId !== userId) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    await prisma.program.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('Program deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}