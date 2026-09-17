import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Datos de suscripcion incompletos" }, { status: 400 });
    }

    const { error } = await supabase
      .from("suscripciones_push")
      .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { endpoint } = body;
    if (!endpoint) return NextResponse.json({ error: "Falta el endpoint" }, { status: 400 });

    await supabase.from("suscripciones_push").delete().eq("endpoint", endpoint);
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
