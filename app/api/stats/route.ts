import { NextRequest, NextResponse } from "next/server";
import { getGlobalStats, getLastSessionStats } from "./stats-repository";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "global";

  try {
    let data;
    if (period === "last") {
      data = await getLastSessionStats();
    } else {
      data = await getGlobalStats();
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}