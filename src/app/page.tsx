"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  Megaphone,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-indigo-600" />
            <span className="text-xl font-bold">ContentBrain</span>
          </div>
          <nav className="flex items-center gap-4">
            {authed === true ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          Haz crecer tu negocio con{" "}
          <span className="text-indigo-600">inteligencia</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Plataforma todo-en-uno para gestión de marketing, ventas y talento.
          Multiempresa, potenciada con IA.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/registro"
            className="rounded-xl bg-indigo-600 px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-indigo-700 transition"
          >
            Empezar gratis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Building2,
              title: "Multiempresa",
              desc: "Gestiona múltiples empresas desde una sola cuenta con aislamiento total de datos.",
            },
            {
              icon: FileText,
              title: "Content Studio",
              desc: "Crea contenido con IA: posts, emails, anuncios y más, adaptados a tu marca.",
            },
            {
              icon: Users,
              title: "Audiencias IA",
              desc: "Define buyer personas y segmentos con scoring automático potenciado por IA.",
            },
            {
              icon: Megaphone,
              title: "Campañas",
              desc: "Crea y gestiona campañas de marketing multicanal con métricas en tiempo real.",
            },
            {
              icon: Briefcase,
              title: "CRM & Leads",
              desc: "Pipeline de ventas completo: leads, oportunidades, seguimiento y cierre.",
            },
            {
              icon: BarChart3,
              title: "Talento & ATS",
              desc: "Publica vacantes, gestiona candidatos, entrevistas y proceso de contratación.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <f.icon className="h-10 w-10 text-indigo-600" />
              <h3 className="mt-4 text-lg font-semibold text-slate-900">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-500">
          ContentBrain · Plataforma Growth · Sales · Talent
        </div>
      </footer>
    </div>
  );
}
