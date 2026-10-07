// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Save, RefreshCw } from "lucide-react";
import { useParams } from "next/navigation";

interface CompanyBrain {
  name: string;
  description: string;
  industry: string;
  valueProposition: string;
  targetAudience: string;
  tone: string;
  website: string;
  whatsapp: string;
  socialLinkedin: string;
  socialInstagram: string;
  socialTwitter: string;
  socialFacebook: string;
  socialTiktok: string;
  products: string[];
  services: string[];
}

const defaultBrain: CompanyBrain = {
  name: "",
  description: "",
  industry: "",
  valueProposition: "",
  targetAudience: "",
  tone: "profesional",
  website: "",
  whatsapp: "",
  socialLinkedin: "",
  socialInstagram: "",
  socialTwitter: "",
  socialFacebook: "",
  socialTiktok: "",
  products: [],
  services: [],
};

export default function BrainPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [brain, setBrain] = useState<CompanyBrain>(defaultBrain);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/companies/${companyId}/brain`)
      .then((res) => res.json())
      .then((data) => {
        if (data.brain) setBrain(data.brain);
        setLoading(false);
      });
  }, [companyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch(`/api/companies/${companyId}/brain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(brain),
    });
    setSaving(false);
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="text-primary" /> Company Brain
          </h1>
          <p className="text-muted-foreground">Configura la identidad y conocimiento de tu empresa para la IA</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="identity">Identidad</TabsTrigger>
            <TabsTrigger value="offer">Oferta</TabsTrigger>
            <TabsTrigger value="audience">Audiencia</TabsTrigger>
            <TabsTrigger value="channels">Canales</TabsTrigger>
            <TabsTrigger value="brand">Marca</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4">
            <Card><CardHeader><CardTitle>Información Básica</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre de la empresa</Label><Input id="name" value={brain.name} onChange={(e) => setBrain({...brain, name: e.target.value})} placeholder="Mi Empresa" /></div>
                <div className="space-y-2"><Label htmlFor="industry">Industria</Label><Input id="industry" value={brain.industry} onChange={(e) => setBrain({...brain, industry: e.target.value})} placeholder="Tecnología / SaaS" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={brain.description} onChange={(e) => setBrain({...brain, description: e.target.value})} placeholder="Describe tu empresa..." /></div>
              <div className="space-y-2"><Label htmlFor="tone">Tono de comunicación</Label><Input id="tone" value={brain.tone} onChange={(e) => setBrain({...brain, tone: e.target.value})} placeholder="profesional, cercano, experto, inspirador..." /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="offer" className="space-y-4">
            <Card><CardHeader><CardTitle>Propuesta de Valor</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="valueProposition">Propuesta de valor principal</Label><Input id="valueProposition" value={brain.valueProposition} onChange={(e) => setBrain({...brain, valueProposition: e.target.value})} placeholder="¿Por qué te eligen?" /></div>
              <div className="space-y-2"><Label htmlFor="targetAudience">Audiencia objetivo general</Label><Input id="targetAudience" value={brain.targetAudience} onChange={(e) => setBrain({...brain, targetAudience: e.target.value})} placeholder="Ej: PYMEs que buscan automatizar marketing" /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <Card><CardHeader><CardTitle>Productos y Servicios (para contexto IA)</CardTitle></CardHeader><CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Estos se usan como contexto al generar contenido. Se sincronizan automáticamente con el módulo Productos.</p>
              <div className="space-y-2">
                <Label>Productos (uno por línea)</Label>
                <textarea className="w-full min-h-[100px] p-3 border rounded" value={brain.products?.join("\n") || ""} onChange={(e) => setBrain({...brain, products: e.target.value.split("\n").filter(Boolean)})} />
              </div>
              <div className="space-y-2">
                <Label>Servicios (uno por línea)</Label>
                <textarea className="w-full min-h-[100px] p-3 border rounded" value={brain.services?.join("\n") || ""} onChange={(e) => setBrain({...brain, services: e.target.value.split("\n").filter(Boolean)})} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card><CardHeader><CardTitle>Canales de Contacto</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="website">Sitio Web</Label><Input id="website" type="url" value={brain.website} onChange={(e) => setBrain({...brain, website: e.target.value})} placeholder="https://miempresa.com" /></div>
              <div className="space-y-2"><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={brain.whatsapp} onChange={(e) => setBrain({...brain, whatsapp: e.target.value})} placeholder="+54 9 11 1234 5678" /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="brand" className="space-y-4">
            <Card><CardHeader><CardTitle>Redes Sociales</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="socialLinkedin">LinkedIn</Label><Input id="socialLinkedin" type="url" value={brain.socialLinkedin} onChange={(e) => setBrain({...brain, socialLinkedin: e.target.value})} placeholder="https://linkedin.com/company/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialInstagram">Instagram</Label><Input id="socialInstagram" type="url" value={brain.socialInstagram} onChange={(e) => setBrain({...brain, socialInstagram: e.target.value})} placeholder="https://instagram.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialTwitter">Twitter/X</Label><Input id="socialTwitter" type="url" value={brain.socialTwitter} onChange={(e) => setBrain({...brain, socialTwitter: e.target.value})} placeholder="https://twitter.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialFacebook">Facebook</Label><Input id="socialFacebook" type="url" value={brain.socialFacebook} onChange={(e) => setBrain({...brain, socialFacebook: e.target.value})} placeholder="https://facebook.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialTiktok">TikTok</Label><Input id="socialTiktok" type="url" value={brain.socialTiktok} onChange={(e) => setBrain({...brain, socialTiktok: e.target.value})} placeholder="https://tiktok.com/@..." /></div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Guardando..." : "Guardar Cambios"}</Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Recargar</Button>
        </div>
      </form>
    </div>
  );
}