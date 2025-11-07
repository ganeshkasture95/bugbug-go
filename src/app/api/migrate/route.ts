import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Add GitHub fields to Program table (if not already added)
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

    // Create Enrollment table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Enrollment" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "programId" TEXT NOT NULL,
        "enrolledAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        
        CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "Enrollment_userId_programId_key" UNIQUE ("userId", "programId")
      );
    `;

    // Add foreign key constraints for Enrollment table
    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'Enrollment_userId_fkey'
        ) THEN
          ALTER TABLE "Enrollment" 
          ADD CONSTRAINT "Enrollment_userId_fkey" 
          FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$;
    `;

    await prisma.$executeRaw`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'Enrollment_programId_fkey'
        ) THEN
          ALTER TABLE "Enrollment" 
          ADD CONSTRAINT "Enrollment_programId_fkey" 
          FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$;
    `;

    // Add new fields to Report table
    await prisma.$executeRaw`
      ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "vulnerabilityType" TEXT DEFAULT 'Other';
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "stepsToReproduce" TEXT DEFAULT '';
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "impact" TEXT DEFAULT '';
    `;
    
    await prisma.$executeRaw`
      ALTER TABLE "Report" ADD COLUMN IF NOT EXISTS "proofOfConcept" TEXT;
    `;

    return NextResponse.json({
      success: true,
      message: 'Database migration completed - Added enrollment system and enhanced reports'
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}