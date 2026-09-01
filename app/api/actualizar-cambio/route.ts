import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Falta la clave EXCHANGE_RATE_API_KEY en .env.local" },
        { status: 500 }
      );
    }

    const respuesta = await fetch(
      `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
    );
    const datos = await respuesta.json();

    if (datos.result !== "success") {
      return NextResponse.json(
        { error: "La API de tipo de cambio no respondió correctamente", detalle: datos },
        { status: 500 }
      );
    }

    const fechaHoy = new Date().toISOString().split("T")[0];

    const usdDOP = datos.conversion_rates.DOP;
    const usdEUR = datos.conversion_rates.EUR;
    const eurDOP = usdDOP / usdEUR;

    const registros = [
      {
        moneda_origen: "USD",
        moneda_destino: "DOP",
        tasa_compra: usdDOP - 0.3,
        tasa_venta: usdDOP + 0.3,
        fecha: fechaHoy,
        fuente: "exchangerate-api",
      },
      {
        moneda_origen: "EUR",
        moneda_destino: "DOP",
        tasa_compra: eurDOP - 0.3,
        tasa_venta: eurDOP + 0.3,
        fecha: fechaHoy,
        fuente: "exchangerate-api",
      },
    ];

    const { data, error } = await supabase
      .from("tipo_cambio")
      .upsert(registros, { onConflict: "moneda_origen,moneda_destino,fecha" })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ mensaje: "Tipo de cambio actualizado", data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}