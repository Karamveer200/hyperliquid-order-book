import { NextRequest, NextResponse } from "next/server";
import { serverConfig } from "@/lib/config/serverConfig";

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: serverConfig.appEnv,
  });
}
