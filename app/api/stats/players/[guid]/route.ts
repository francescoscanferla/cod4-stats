import { NextRequest, NextResponse } from "next/server";
import { getPlayerDetails } from '@/app/api/stats/stats-repository';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ guid: string }> }
) {
    const { guid } = await params;

    if (!guid) {
        return NextResponse.json({ error: "Missing player GUID parameter" }, { status: 400 });
    }

    try {
        const data = await getPlayerDetails(guid);

        if (!data) {
            return NextResponse.json({ error: "Player not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error("API Route dynamic player error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}