-- Add GitHub integration fields to Program table
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "githubRepo" TEXT;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "githubIssues" TEXT[] DEFAULT '{}';
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "maintainerEmail" TEXT;
ALTER TABLE "Program" ADD COLUMN IF NOT EXISTS "codeLanguages" TEXT[] DEFAULT '{}';