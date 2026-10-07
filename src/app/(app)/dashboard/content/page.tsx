// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Sparkles, Edit, Trash2, Copy, Save, FileText, MessageSquare, Target, Zap } from "lucide-react";
import { useParams } from "next/navigation";

interface Content {
  id: string;
  type: string;
  output: Record<string, unknown>;
  variants: Array<Record<string, unknown>>;
  input: Record<string, unknown>;
  createdAt: string;
}

interface Product { id: string; name: string; }
interface Audience { id: string; name: string; }
interface Campaign { id: string; name: string; }

const contentTypes = ["post", "ad", "script", "email", "story", "reel", "article", "hook", "cta", "hashtags"] as const;
const channels = ["facebook", "instagram", "linkedin", "twitter", "tiktok", "email", "whatsapp", "web", "otro"] as const;

export default function ContentStudioPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [content, setContent] = useState<Content[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    type: "post",
    objective: "",
    channel: "instagram",
    tone: "profesional",
    productId: "",
    audienceId: "",
    campaignId: "",
    variantsCount: 3,
  });
  const [generated, setGenerated] = useState<Content | null>(null);
  const [generating, setGenerating] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies/${companyId}/content`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/products`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/audiences`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/campaigns`).then(r => r.json()),
    ]).then(([c, p, a, ca]) => {
      setContent(c.content);
      setProducts(p.products);
      setAudiences(a.audiences);
      setCampaigns(ca.campaigns);
      setLoading(false);
    });
  }, [companyId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/content`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const result = await res.json();
        setGenerated(result.content);
        setStep(2);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generated) return;
    setGenerating(true);
    try {
      const res = await fetch(`/api/companies/${companyId}/content/${generated.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regenerate: true, variantsCount: form.variantsCount }),
      });
      if (res.ok) {
        const result = await res.json();
        setGenerated(result.content);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveVariant = async (variant: Record<string, unknown>) => {
    if (!generated) return;
    await fetch(`/api/companies/${companyId}/content/${generated.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ output: variant }),
    });
    setContent([generated, ...content]);
    setGenerated(null);
    setStep(1);
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><MessageSquare className="text-primary" /> Content Studio</h1>
          <p className="text-muted-foreground">Genera, edita y guarda contenido con IA</p>
        </div>
      </div>

      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList>
          <TabsTrigger value="generate"><Zap className="mr-2 h-4 w-4" />Generar</TabsTrigger>
          <TabsTrigger value="library"><FileText className="mr-2 h-4 w-4" />Biblioteca</TabsTrigger>
        </TabsList>

        <TabsContent value="generate">
          {step === 1 && (
            <Card className="border-primary">
              <CardHeader><CardTitle className="flex items-center gap-2"><Sparkles className="text-primary" />Paso 1: Configurar Generación</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4 max-w-2xl">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Tipo de Contenido *</Label>
                      <Select value={form.type} onValueChange={(v) => setForm({...form, type: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{contentTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Canal *</Label>
                      <Select value={form.channel} onValueChange={(v) => setForm({...form, channel: v as any})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Objetivo *</Label><Input value={form.objective} onChange={(e) => setForm({...form, objective: e.target.value})} placeholder="Ej: Generar engagement para lanzamiento de producto" required /></div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2"><Label>Tono *</Label><Input value={form.tone} onChange={(e) => setForm({...form, tone: e.target.value})} placeholder="profesional" required /></div>
                    <div className="space-y-2"><Label>Producto (opcional)</Label>
                      <Select value={form.productId} onValueChange={(v) => setForm({...form, productId: v})}>
                        <SelectTrigger><SelectValue placeholder="Sin producto" /></SelectTrigger>
                        <SelectContent><SelectItem value="">Sin producto</SelectItem>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Audiencia (opcional)</Label>
                      <Select value={form.audienceId} onValueChange={(v) => setForm({...form, audienceId: v})}>
                        <SelectTrigger><SelectValue placeholder="Sin audiencia" /></SelectTrigger>
                        <SelectContent><SelectItem value="">Sin audiencia</SelectItem>{audiences.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2"><Label>Variantes a generar</Label><Input type="number" min={1} max={5} value={form.variantsCount} onChange={(e) => setForm({...form, variantsCount: Number(e.target.value)})} /></div>
                  <Button type="submit" disabled={generating} className="w-full"><Sparkles className="mr-2 h-4 w-4" />{generating ? "Generando..." : "Generar Contenido"}</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {step === 2 && generated && (
            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2"><Sparkles className="text-green-500" />Paso 2: Revisar y Seleccionar</CardTitle>
                  <Button variant="outline" onClick={() => setStep(1)}><Zap className="mr-2 h-4 w-4" />Cambiar Configuración</Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Contenido Principal</h4>
                    <div className="p-4 border rounded-lg bg-muted/50 space-y-3">
                      {Object.entries(generated.output).map(([key, value]) => (
                        <div key={key} className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground uppercase">{key}</label>
                          <p className="whitespace-pre-wrap">{String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {generated.variants.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Variantes ({generated.variants.length})</h4>
                      <div className="grid gap-4 md:grid-cols-2">
                        {generated.variants.map((variant, i) => (
                          <Card key={i} className={selectedVariant === variant ? "border-primary ring-2 ring-primary" : ""} onClick={() => setSelectedVariant(variant)}>
                            <CardContent className="p-4 space-y-2">
                              {Object.entries(variant).map(([key, value]) => (
                                <div key={key} className="space-y-1">
                                  <label className="text-xs font-medium text-muted-foreground uppercase">{key}</label>
                                  <p className="text-sm line-clamp-3">{String(value)}</p>
                                </div>
                              ))}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={handleRegenerate} disabled={generating}><Sparkles className="mr-2 h-4 w-4" />Regenerar</Button>
                    <Button onClick={() => handleSaveVariant(selectedVariant || generated.output)} disabled={!selectedVariant && !generated.variants.length}><Save className="mr-2 h-4 w-4" />Guardar {selectedVariant ? "Variante" : "Principal"}</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="library">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Contenidos Guardados ({content.length})</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {content.map((item) => (
              <Card key={item.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg capitalize">{item.type}</CardTitle>
                  <Badge variant="outline">{item.type}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="p-3 border rounded bg-muted/50 text-sm">
                    {Object.entries(item.output).slice(0, 2).map(([k, v]) => (
                      <div key={k}><span className="font-medium text-muted-foreground">{k}: </span>{String(v).slice(0, 100)}...</div>
                    ))}
                  </div>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    {item.input.channel && <span>{item.input.channel}</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}