const systemeApi = "https://api.systeme.io/api";
const leadTagId = 2154453;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function safeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index++) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return json({ error: "Integração indisponível" }, 503);

  let body: { firstName?: unknown; email?: unknown; consent?: unknown };
  let integrationStep = "secrets";
  try {
    body = await request.json();
  } catch {
    return json({ error: "Dados inválidos" }, 400);
  }

  const firstName = typeof body.firstName === "string" ? body.firstName.trim().slice(0, 80) : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!firstName || !validEmail || body.consent !== true) return json({ error: "Preencha os campos obrigatórios" }, 422);

  try {
    const secretResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/get_ciclo_mob_integration_secrets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": serviceRoleKey,
        "Authorization": `Bearer ${serviceRoleKey}`,
      },
      body: "{}",
    });
    if (!secretResponse.ok) throw new Error(`secret:${secretResponse.status}`);
    const secrets = await secretResponse.json();
    const apiKey = secrets?.systemeApiKey;
    const proxySecret = secrets?.proxySecret;
    const suppliedSecret = request.headers.get("X-Ciclo-Mob-Secret") ?? "";
    if (typeof apiKey !== "string" || typeof proxySecret !== "string") throw new Error("missing-secrets");
    if (!safeEqual(suppliedSecret, proxySecret)) return json({ error: "Não autorizado" }, 401);
    const headers = { "Content-Type": "application/json", "X-API-Key": apiKey };

    integrationStep = "lookup";
    const lookup = await fetch(`${systemeApi}/contacts?email=${encodeURIComponent(email)}&limit=10`, { headers });
    if (!lookup.ok) throw new Error(`lookup:${lookup.status}`);
    const existing = await lookup.json();
    let contactId = existing.items?.[0]?.id as number | undefined;

    if (!contactId) {
      integrationStep = "create";
      const created = await fetch(`${systemeApi}/contacts`, {
        method: "POST",
        headers,
        body: JSON.stringify({ email, locale: "pt" }),
      });
      if (!created.ok) throw new Error(`create:${created.status}`);
      contactId = (await created.json()).id;
    }

    if (!contactId) throw new Error("missing-contact-id");
    integrationStep = "tag";
    const tagged = await fetch(`${systemeApi}/contacts/${contactId}/tags`, {
      method: "POST",
      headers,
      body: JSON.stringify({ tagId: leadTagId }),
    });
    if (!tagged.ok && tagged.status !== 409) throw new Error(`tag:${tagged.status}`);

    return json({ ok: true });
  } catch (error) {
    console.error("Ciclo MOB lead capture failed", integrationStep, error instanceof Error ? error.message : "unknown");
    return json({ error: "Não foi possível concluir o cadastro", step: integrationStep }, 502);
  }
});
