// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users, Sparkles, Brain } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useCompany } from "@/components/company-provider";

interface Audience {
  id: string;
  name: string;
  description: string;
  avatarName: string;
  demographics: Record<string, unknown>;
  needs: string[];
  pains: string[];
  motivations: string[];
  objections: string[];
  tone: string;
  cta: string;
}

interface Product {
  id: string;
  name: string;
}

export default function AudiencesPage() {
  const { companyId, loading: companyLoading } = useCompany();
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [generateMode, setGenerateMode] = useState(false);
  const [editing, setEditing] = useState<Audience | null>(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    avatarName: "",
    demographics: JSON.stringify({ edad: "", genero: "", ubicacion: "", ingresos: "", cargo: "" }, null, 2),
    needs: "",
    pains: "",
    motivations: "",
    objections: "",
    tone: "profesional",
    cta: "",
    brief: "",
    productId: "",
  });

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/companies/${companyId}/audiences`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/products`).then(r => r.json()),
    ]).then(([audData, prodData]) => {
      setAudiences(audData.audiences);
      setProducts(prodData.products);
      setLoading(false);
    });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...form,
      demographics: JSON.parse(form.demographics || "{}"),
      needs: form.needs.split("\n").filter(Boolean),
      pains: form.pains.split("\n").filter(Boolean),
      motivations: form.motivations.split("\n").filter(Boolean),
      objections: form.objections.split("\n").filter(Boolean),
    };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/audiences/${editing.id}` : `/api/companies/${companyId}/audiences`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setAudiences(audiences.map(a => a.id === editing.id ? result.audience : a));
      else setAudiences([...audiences, result.audience]);
      resetForm();
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/companies/${companyId}/audiences`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ generateWithAI: true, productId: form.productId || undefined, brief: form.brief }),
    });
    if (res.ok) {
      const result = await res.json();
      setAudiences([...audiences, result.audience]);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta audiencia?")) return;
    await fetch(`/api/companies/${companyId}/audiences/${id}`, { method: "DELETE" });
    setAudiences(audiences.filter(a => a.id !== id));
  };

  const resetForm = () => {
    setForm({ name: "", description: "", avatarName: "", demographics: JSON.stringify({ edad: "", genero: "", ubicacion: "", ingresos: "", cargo: "" }, null, 2), needs: "", pains: "", motivations: "", objections: "", tone: "profesional", cta: "", brief: "", productId: "" });
    setShowForm(false);
    setEditing(null);
    setGenerateMode(false);
  };

  if (companyLoading || loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!companyId) return <p className="text-muted-foreground">Selecciona una empresa para comenzar.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Users className="text-primary" /> Audiencias</h1>
          <p className="text-muted-foreground">Perfiles de cliente ideal (avatars) para marketing dirigido</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { setGenerateMode(false); setEditing(null); resetForm(); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Crear Manual</Button>
          <Button variant="outline" onClick={() => { setGenerateMode(true); setEditing(null); resetForm(); setShowForm(true); }}><Sparkles className="mr-2 h-4 w-4" />Generar con IA</Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{generateMode ? "Generar Audiencia con IA" : editing ? "Editar Audiencia" : "Crear Audiencia"}</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={generateMode ? handleGenerate : handleSubmit} className="space-y-4 max-w-3xl">
              {!generateMode && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                    <div className="space-y-2"><Label htmlFor="avatarName">Nombre del Avatar</Label><Input id="avatarName" value={form.avatarName} onChange={(e) => setForm({...form, avatarName: e.target.value})} placeholder="María, Gerente de Marketing" /></div>
                  </div>
                  <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
                  <div className="space-y-2"><Label>Demografía (JSON)</Label><textarea className="w-full min-h-[80px] p-3 border rounded font-mono text-sm" value={form.demographics} onChange={(e) => setForm({...form, demographics: e.target.value})} /></div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Necesidades (una por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.needs} onChange={(e) => setForm({...form, needs: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Dolores/Problemas (una por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.pains} onChange={(e) => setForm({...form, pains: e.target.value})} /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2"><Label>Motivaciones (una por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.motivations} onChange={(e) => setForm({...form, motivations: e.target.value})} /></div>
                    <div className="space-y-2"><Label>Objeciones (una por línea)</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.objections} onChange={(e) => setForm({...form, objections: e.target.value})} /></div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2"><Label htmlFor="tone">Tono</Label><Input id="tone" value={form.tone} onChange={(e) => setForm({...form, tone: e.target.value})} /></div>
                    <div className="space-y-2"><Label htmlFor="cta">CTA Sugerido</Label><Input id="cta" value={form.cta} onChange={(e) => setForm({...form, cta: e.target.value})} /></div>
                  </div>
                </>
              )}

            {generateMode && (
              <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="brief">Brief para la IA *</Label><textarea id="brief" className="w-full min-h-[100px] p-3 border rounded" value={form.brief} onChange={(e) => setForm({...form, brief: e.target.value})} placeholder="Describe el tipo de audiencia que buscas, ej: 'Empresas B2B medianas que necesitan automatizar su marketing digital...'" required /></div>
                <div className="space-y-2"><Label>Producto de referencia (opcional)</Label>
                  <Select value={form.productId} onValueChange={(v) => setForm({...form, productId: v})}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar producto" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin producto</SelectItem>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="submit">{generateMode ? "Generar con IA" : editing ? "Actualizar" : "Crear"}</Button>
              <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audiences.map((audience) => (
          <Card key={audience.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{audience.name}</CardTitle>
                {audience.avatarName && <p className="text-sm text-muted-foreground">Avatar: {audience.avatarName}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(audience); setForm({ name: audience.name, description: audience.description, avatarName: audience.avatarName || "", demographics: JSON.stringify(audience.demographics, null, 2), needs: audience.needs.join("\n"), pains: audience.pains.join("\n"), motivations: audience.motivations.join("\n"), objections: audience.objections.join("\n"), tone: audience.tone, cta: audience.cta || "", brief: "", productId: "" }); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(audience.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{audience.description}</p>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline">{audience.tone}</Badge>
                <Badge variant="secondary">{audience.needs.length} necesidades</Badge>
                <Badge variant="secondary">{audience.pains.length} dolores</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}