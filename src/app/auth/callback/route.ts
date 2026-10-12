import { NextResponse } from "next/server";

export function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (token) {
    return NextResponse.redirect(
      new URL(
        `/confirmar-email?token=${encodeURIComponent(token)}`,
        url.origin,
      ),
    );
  }

  return NextResponse.redirect(new URL("/login?erro=confirmacao", url.origin));
}
