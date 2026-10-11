"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import {
  BarChart3,
  Briefcase,
  Building2,
  FileText,
  Megaphone,
  Users,
} from "lucide-react";

export default function HomePage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => setAuthed(r.ok))
      .catch(() => setAuthed(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] text-slate-100">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0a1628]/90 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-6 py-4">
          <BrandLogo priority imageClassName="w-[200px]" />
          <nav className="flex items-center gap-4">
            {authed === true ? (
              <Link
                href="/dashboard"
                className="rounded-lg bg-[#e03e52] px-4 py-2 text-sm font-medium text-white hover:bg-[#c92b3f] transition"
              >
                Ir al Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="rounded-lg bg-[#e03e52] px-4 py-2 text-sm font-medium text-white hover:bg-[#c92b3f] transition"
                >
                  Crear cuenta
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-24 pb-16 text-center">
        <div className="flex justify-center mb-10">
          <BrandLogo priority imageClassName="w-[320px]" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl">
          Haz crecer tu negocio con{" "}
          <span className="text-[#e03e52]">inteligencia</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Plataforma CFDIGITAL todo-en-uno para gestión de marketing, ventas y
          talento. Multiempresa, potenciada con IA.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/registro"
            className="rounded-xl bg-[#e03e52] px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-[#c92b3f] transition"
          >
            Empezar gratis
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-slate-600 bg-transparent px-8 py-3 text-base font-semibold text-slate-200 hover:bg-white/5 transition"
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
              className="rounded-2xl border border-white/10 bg-[#0f1f3d] p-6 shadow-sm hover:shadow-md transition"
            >
              <f.icon className="h-10 w-10 text-[#e03e52]" />
              <h3 className="mt-4 text-lg font-semibold text-white">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-slate-300">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0a1628]">
        <div className="mx-auto max-w-6xl px-6 py-8 text-center text-sm text-slate-400">
          CFDIGITAL · Plataforma Growth · Sales · Talent
        </div>
      </footer>
    </div>
  );
}
