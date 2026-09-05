import { NextRequest, NextResponse } from "next/server";

const functionUrl = "https://heglcvgpverqfmqpdyok.supabase.co/functions/v1/ciclo-mob-lead";
const defaultOrigins = [
  "https://app.ciclomob.cuidadosdamulher.com.br",
  "https://ciclo-mob.guilhermepps.chatgpt.site",
];

function allowedOrigins() {
  return (process.env.ALLOWED_ORIGINS ?? defaultOrigins.join(","))
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export async function POST(request: NextRequest) {
  if (!allowedOrigins().includes(request.headers.get("origin") ?? "")) {
    return NextResponse.json({ error: "Origem não autorizada" }, { status: 403 });
  }

  const proxySecret = process.env.LEAD_PROXY_SECRET;
  if (!proxySecret) {
    return NextResponse.json({ error: "Integração indisponível" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  try {
    const response = await fetch(functionUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Ciclo-Mob-Secret": proxySecret,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    return NextResponse.json(result, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Não foi possível concluir o cadastro" }, { status: 502 });
  }
}
