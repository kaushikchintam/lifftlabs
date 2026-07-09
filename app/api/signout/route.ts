import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  await auth.api.signOut({ headers: req.headers });
  const response = NextResponse.json({ success: true });
  response.cookies.delete("role");
  return response;
}
