"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (response.ok) {
      router.push("/dashboard");
      return;
    }
    const body = await response.json().catch(() => null);
    setError(body?.error?.message ?? "No se pudo iniciar sesión");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-6">
      <BrandLogo priority imageClassName="w-[190px]" />
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
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
        <label className="flex flex-col gap-1 text-sm">
          Contraseña
          <input
            className="rounded border border-neutral-300 px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </label>
        {error ? (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
      <p className="text-sm text-neutral-600">
        <a className="underline" href="/registro">
          Crear cuenta
        </a>{" "}
        ·{" "}
        <a className="underline" href="/recuperar">
          ¿Olvidaste tu contraseña?
        </a>
      </p>
    </main>
  );
}
