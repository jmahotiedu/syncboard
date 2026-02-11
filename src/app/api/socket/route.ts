import { NextResponse } from "next/server";

import { startSocketServer } from "@/server/socket-server";

export const runtime = "nodejs";

export async function GET() {
  const { started, port } = startSocketServer();
  return NextResponse.json({
    started,
    url: process.env.NEXT_PUBLIC_SOCKET_URL ?? `http://localhost:${port}`,
  });
}
