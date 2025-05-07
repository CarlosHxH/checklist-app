import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth(async function middleware(req: NextRequest) {
  return NextResponse.next();
});