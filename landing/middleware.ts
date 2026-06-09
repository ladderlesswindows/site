import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { MOM_EASTER_EGG_PATH, MOM_EASTER_EGG_ZIP } from '@/lib/easterEggZips';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === MOM_EASTER_EGG_PATH) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith('/booking') &&
    searchParams.get('zip')?.trim() === MOM_EASTER_EGG_ZIP
  ) {
    const url = request.nextUrl.clone();
    url.pathname = MOM_EASTER_EGG_PATH;
    url.search = `zip=${MOM_EASTER_EGG_ZIP}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/booking/:path*'],
};