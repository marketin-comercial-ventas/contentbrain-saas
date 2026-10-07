"use client";

import { useState } from "react";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setDevToken(null);
    const response = await fetch("/api/auth/forgot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setLoading(false);
    const body = await response.json().catch(() => null);
    if (!response.ok) {
      setError(body?.error?.message ?? "No se pudo procesar la solicitud");
      return;
    }
    setMessage("Si existe una cuenta con ese correo, recibirás instrucciones.");
    if (body?.devToken) setDevToken(body.devToken);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <h1 className="text-2xl font-semibold">Recuperar contraseña</h1>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Correo
          <input
            className="rounded border border-neutral-300 px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {message ? <p className="text-sm text-green-700">{message}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Enviando…" : "Enviar instrucciones"}
        </button>
      </form>
      {devToken ? (
        <p className="break-all rounded bg-amber-50 p-3 text-xs">
          Token de desarrollo (solo fuera de producción):{" "}
          <code data-testid="dev-token">{devToken}</code>
        </p>
      ) : null}
      <p className="text-sm text-neutral-600">
        <a className="underline" href="/restablecer">
          Ya tengo un token
        </a>
      </p>
    </main>
  );
}
