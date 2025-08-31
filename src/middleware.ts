// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from './lib/auth';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/api/reports',
  '/api/programs',
  '/api/user',
];

// Admin only routes
const adminRoutes = [
  '/admin',
  '/api/admin',
];

// Company only routes
const companyRoutes = [
  '/company',
  '/api/company',
];

// Researcher only routes
const researcherRoutes = [
  '/researcher',
  '/api/researcher',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  console.log('Middleware running for:', pathname);
  
  // Skip middleware for public routes and static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/forgot-password' ||
    pathname === '/reset-password' ||
    pathname.startsWith('/(auth)') ||
    pathname === '/dashboard' // Temporarily allow dashboard access
  ) {
    console.log('Skipping middleware for public route:', pathname);
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isCompanyRoute = companyRoutes.some(route => pathname.startsWith(route));
  const isResearcherRoute = researcherRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute || isCompanyRoute || isResearcherRoute) {
    const token = request.cookies.get('accessToken')?.value;
    console.log('Checking protected route:', pathname, 'Token exists:', !!token);

    if (!token) {
      console.log('No token found, redirecting to login');
      // Redirect to login for web pages, return 401 for API routes
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    console.log('Verifying token...');
    const payload = await AuthService.verifyAccessToken(token);
    console.log('Token verification result:', !!payload, payload?.userId);
    
    if (!payload) {
      console.log('Token verification failed, redirecting to login');
      // Token is invalid, redirect to login
      const response = pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Invalid token' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
      
      // Clear invalid token
      response.cookies.delete('accessToken');
      response.cookies.delete('refreshToken');
      return response;
    }
    
    console.log('Token verified successfully for user:', payload.userId);

    // Check role-based access
    if (isAdminRoute && payload.role !== 'Admin') {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isCompanyRoute && payload.role !== 'Company') {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (isResearcherRoute && payload.role !== 'Researcher') {
      return pathname.startsWith('/api/')
        ? NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        : NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Add user info to request headers for API routes
    if (pathname.startsWith('/api/')) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', payload.userId);
      requestHeaders.set('x-user-email', payload.email);
      requestHeaders.set('x-user-role', payload.role);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};