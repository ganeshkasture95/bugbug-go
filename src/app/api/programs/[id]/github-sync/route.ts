import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AuthService } from '@/lib/auth';
import { z } from 'zod';

const syncSchema = z.object({
  action: z.enum(['sync-issues', 'update-issues']),
  issues: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.userId;

    const { id: programId } = await params;
    const body = await request.json();
    const validatedData = syncSchema.parse(body);

    // Verify program ownership
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        companyId: userId,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (validatedData.action === 'update-issues') {
      // Update the program's GitHub issues
      const updatedProgram = await prisma.program.update({
        where: { id: programId },
        data: {
          githubIssues: validatedData.issues || [],
        },
        include: {
          company: {
            select: { name: true, email: true }
          }
        }
      });

      return NextResponse.json({
        success: true,
        program: updatedProgram,
      });
    }

    if (validatedData.action === 'sync-issues' && program.githubRepo) {
      // Fetch issues from GitHub API
      try {
        const response = await fetch(
          `https://api.github.com/repos/${program.githubRepo}/issues?state=open&per_page=50`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'BugBounty-Platform',
            },
          }
        );

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`);
        }

        const issues = await response.json();
        
        // Filter out pull requests (GitHub API includes PRs in issues endpoint)
        const actualIssues = issues.filter((issue: { pull_request?: unknown }) => !issue.pull_request);
        
        // Extract issue URLs
        const issueUrls = actualIssues.map((issue: { html_url: string }) => issue.html_url);

        return NextResponse.json({
          success: true,
          issues: actualIssues,
          issueUrls,
          count: actualIssues.length,
        });
      } catch (error) {
        return NextResponse.json(
          { error: 'Failed to sync with GitHub' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user from token
    const token = request.cookies.get('accessToken')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await AuthService.verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    const userId = decoded.userId;

    const { id: programId } = await params;

    // Get program with GitHub info
    const program = await prisma.program.findFirst({
      where: {
        id: programId,
        companyId: userId,
      },
      select: {
        id: true,
        githubRepo: true,
        githubIssues: true,
      },
    });

    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    if (!program.githubRepo) {
      return NextResponse.json({ error: 'No GitHub repository configured' }, { status: 400 });
    }

    // Fetch repository info and issues
    try {
      const [repoResponse, issuesResponse] = await Promise.all([
        fetch(`https://api.github.com/repos/${program.githubRepo}`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'BugBounty-Platform',
          },
        }),
        fetch(`https://api.github.com/repos/${program.githubRepo}/issues?state=open&per_page=50`, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'BugBounty-Platform',
          },
        }),
      ]);

      if (!repoResponse.ok || !issuesResponse.ok) {
        throw new Error('GitHub API error');
      }

      const [repoData, issuesData] = await Promise.all([
        repoResponse.json(),
        issuesResponse.json(),
      ]);

      // Filter out pull requests
      const actualIssues = issuesData.filter((issue: { pull_request?: unknown }) => !issue.pull_request);

      return NextResponse.json({
        success: true,
        repository: {
          name: repoData.name,
          full_name: repoData.full_name,
          description: repoData.description,
          language: repoData.language,
          stargazers_count: repoData.stargazers_count,
          open_issues_count: repoData.open_issues_count,
          html_url: repoData.html_url,
        },
        issues: actualIssues,
        linkedIssues: program.githubIssues,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch GitHub data' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('GitHub sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}