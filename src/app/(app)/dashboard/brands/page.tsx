"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag, Building2, Globe, Sparkles } from "lucide-react";
import { useParams } from "next/navigation";

const brandTypes = ["principal", "secundaria", "producto", "servicio", "franquicia"] as const;

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  type: string;
  isActive: boolean;
  website: string;
}

export default function BrandsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", logoUrl: "",
    primaryColor: "#3b82f6", secondaryColor: "#1e40af", type: "principal",
    isActive: true, website: "",
  });

  useEffect(() => {
    fetch(`/api/companies/${companyId}/brands`).then(r => r.json()).then(data => { setBrands(data.brands); setLoading(false); });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/brands/${editing.id}` : `/api/companies/${companyId}/brands`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setBrands(brands.map(b => b.id === editing.id ? result.brand : b));
      else setBrands([...brands, result.brand]);
      setShowForm(false);
      setEditing(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => { if (!confirm("¿Eliminar esta marca?")) return; await fetch(`/api/companies/${companyId}/brands/${id}`, { method: "DELETE" }); setBrands(brands.filter(b => b.id !== id)); };

  const resetForm = () => setForm({ name: "", slug: "", description: "", logoUrl: "", primaryColor: "#3b82f6", secondaryColor: "#1e40af", type: "principal", isActive: true, website: "" });

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Tag className="text-primary" /> Marcas</h1>
          <p className="text-muted-foreground">Gestiona las marcas de tu empresa</p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Nueva Marca</Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Marca</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label htmlFor="slug">Slug *</Label><Input id="slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} required placeholder="mi-marca" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="type">Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{brandTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="primaryColor">Color Primario</Label><Input id="primaryColor" type="color" value={form.primaryColor} onChange={(e) => setForm({...form, primaryColor: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="secondaryColor">Color Secundario</Label><Input id="secondaryColor" type="color" value={form.secondaryColor} onChange={(e) => setForm({...form, secondaryColor: e.target.value})} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="website">Sitio Web</Label><Input id="website" type="url" value={form.website} onChange={(e) => setForm({...form, website: e.target.value})} placeholder="https://marca.com" /></div>
                <div className="space-y-2"><Label>Activa</Label>
                  <Select value={form.isActive.toString()} onValueChange={(v) => setForm({...form, isActive: v === "true"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Sí</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Card key={brand.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: brand.primaryColor }}>
                  <Sparkles className="h-4 w-4" />
                </div>
                <CardTitle className="text-lg">{brand.name}</CardTitle>
              </div>
              <Badge variant={brand.isActive ? "success" : "secondary"}>{brand.type}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{brand.description}</p>
              <div className="flex flex-wrap gap-1 text-xs">
                <Badge variant="outline">{brand.slug}</Badge>
                {brand.website && <Badge variant="outline"><Globe className="mr-1 h-3 w-3" />{brand.website}</Badge>}
              </div>
              <div className="flex gap-1 pt-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(brand); setForm({...brand}); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(brand.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}