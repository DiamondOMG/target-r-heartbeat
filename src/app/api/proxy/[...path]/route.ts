import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://18.143.141.90";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const targetUrl = `${BACKEND_URL}/${path.join("/")}${req.nextUrl.search}`;
    
    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        "User-Agent": "TargetR-Vercel-Proxy",
      },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch from backend", details: error.message },
      { status: 502 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await context.params;
    const targetUrl = `${BACKEND_URL}/${path.join("/")}`;
    const body = await req.json();

    const res = await fetch(targetUrl, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to patch backend", details: error.message },
      { status: 502 }
    );
  }
}
