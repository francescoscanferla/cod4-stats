import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data: latestSession, error } = await supabase
      .from("sessions")
      .select("session_date")
      .order("session_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !latestSession) {
      return NextResponse.json({ session_date: null });
    }

    return NextResponse.json({ session_date: latestSession.session_date });
  } catch (error) {
    console.error("API Route error:", error);
    return NextResponse.json({ session_date: null }, { status: 500 });
  }
}