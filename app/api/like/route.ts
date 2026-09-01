import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("sitio_likes").select("total").eq("id", 1).single();
  if (error || !data) {
    return NextResponse.json({ total: 0 });
  }
  return NextResponse.json({ total: data.total });
}

export async function POST() {
  const { data: actual } = await supabase.from("sitio_likes").select("total").eq("id", 1).single();
  const nuevoTotal = (actual?.total || 0) + 1;

  const { error } = await supabase.from("sitio_likes").update({ total: nuevoTotal }).eq("id", 1);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ total: nuevoTotal });
}
