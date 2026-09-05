"use client";

import { FormEvent, useState } from "react";

const endpoint = "/api/lead";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    if (data.get("website")) return;
    setStatus("sending");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.get("firstName"),
          email: data.get("email"),
          consent: data.get("consent") === "on",
        }),
      });

      if (!response.ok) throw new Error("Falha no cadastro");
      setStatus("success");
      form.reset();
      window.open("/guia-pratico-observacao-ciclo-mob.pdf", "_blank", "noopener,noreferrer");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return <div className="success" role="status"><span>✓</span><h3>Guia liberado!</h3><p>O download foi aberto e seus dados foram cadastrados com segurança.</p><a className="button primary full" href="/guia-pratico-observacao-ciclo-mob.pdf" target="_blank" rel="noreferrer">Abrir o guia novamente</a></div>;
  }

  return <form className="nativeLeadForm" onSubmit={submit}>
    <label>Seu nome<input name="firstName" type="text" autoComplete="given-name" placeholder="Como podemos chamar você?" required/></label>
    <label>Seu melhor e-mail<input name="email" type="email" autoComplete="email" placeholder="voce@exemplo.com" required/></label>
    <input className="honeypot" name="website" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <label className="consent"><input name="consent" type="checkbox" required/><span>Concordo em receber o guia e conteúdos do Ciclo MOB. Posso cancelar quando quiser.</span></label>
    <button className="button primary full" type="submit" disabled={status === "sending"}>{status === "sending" ? "Enviando…" : "Quero receber o guia gratuito"}</button>
    {status === "error" && <p className="formError" role="alert">Não foi possível concluir agora. Verifique os dados e tente novamente.</p>}
    <small>Seus dados serão usados apenas para enviar conteúdos relacionados ao Ciclo MOB.</small>
  </form>;
}
