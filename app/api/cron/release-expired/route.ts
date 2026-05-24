import { NextResponse } from "next/server";
import { releaseExpiredReservations } from "@/lib/cleanup-expired";

export async function POST(req: Request) {
  try {
    // Basic auth check for Vercel Cron
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', {
        status: 401,
      });
    }

    const releasedCount = await releaseExpiredReservations();
    return NextResponse.json({ success: true, releasedCount });
  } catch (error) {
    console.error("Cron failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
