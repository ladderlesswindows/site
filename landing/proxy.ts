import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { MOM_EASTER_EGG_PATH, MOM_EASTER_EGG_ZIP } from "@/lib/easterEggZips";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith(MOM_EASTER_EGG_PATH)) {
    return NextResponse.next();
  }

  if (
    pathname.startsWith("/booking") &&
    searchParams.get("zip")?.trim() === MOM_EASTER_EGG_ZIP
  ) {
    const url = request.nextUrl.clone();
    const momSuffix = pathname.slice("/booking".length);
    url.pathname = `${MOM_EASTER_EGG_PATH}${momSuffix}`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/booking/:path*"],
};