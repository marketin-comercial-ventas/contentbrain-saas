// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Target, Calendar, CalendarDays } from "lucide-react";
import { useParams } from "next/navigation";

const channels = ["facebook", "instagram", "linkedin", "twitter", "tiktok", "email", "whatsapp", "web", "otro"] as const;
const statuses = ["draft", "active", "paused", "completed", "archived"] as const;

interface Campaign {
  id: string;
  name: string;
  objective: string;
  productId: string | null;
  audienceId: string | null;
  channel: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
}

interface Product { id: string; name: string; }
interface Audience { id: string; name: string; }

export default function CampaignsPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [audiences, setAudiences] = useState<Audience[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [form, setForm] = useState({
    name: "",
    objective: "",
    productId: "",
    audienceId: "",
    channel: "web",
    startDate: "",
    endDate: "",
    status: "draft",
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies/${companyId}/campaigns`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/products`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/audiences`).then(r => r.json()),
    ]).then(([c, p, a]) => {
      setCampaigns(c.campaigns);
      setProducts(p.products);
      setAudiences(a.audiences);
      setLoading(false);
    });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, startDate: form.startDate || null, endDate: form.endDate || null, productId: form.productId || null, audienceId: form.audienceId || null };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/campaigns/${editing.id}` : `/api/companies/${companyId}/campaigns`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setCampaigns(campaigns.map(c => c.id === editing.id ? result.campaign : c));
      else setCampaigns([...campaigns, result.campaign]);
      setShowForm(false);
      setEditing(null);
      resetForm();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    await fetch(`/api/companies/${companyId}/campaigns/${id}`, { method: "DELETE" });
    setCampaigns(campaigns.filter(c => c.id !== id));
  };

  const resetForm = () => setForm({ name: "", objective: "", productId: "", audienceId: "", channel: "web", startDate: "", endDate: "", status: "draft" });

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Target className="text-primary" /> Campañas</h1>
          <p className="text-muted-foreground">Planifica y gestiona tus campañas de marketing</p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Nueva Campaña</Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Campaña</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label htmlFor="channel">Canal *</Label>
                  <Select value={form.channel} onValueChange={(v) => setForm({...form, channel: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{channels.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="objective">Objetivo</Label><Input id="objective" value={form.objective} onChange={(e) => setForm({...form, objective: e.target.value})} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Producto</Label>
                  <Select value={form.productId} onValueChange={(v) => setForm({...form, productId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin producto" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin producto</SelectItem>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Audiencia</Label>
                  <Select value={form.audienceId} onValueChange={(v) => setForm({...form, audienceId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin audiencia" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin audiencia</SelectItem>{audiences.map(a => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Estado</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({...form, status: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="startDate">Fecha Inicio</Label><Input id="startDate" type="date" value={form.startDate} onChange={(e) => setForm({...form, startDate: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="endDate">Fecha Fin</Label><Input id="endDate" type="date" value={form.endDate} onChange={(e) => setForm({...form, endDate: e.target.value})} /></div>
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
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{campaign.name}</CardTitle>
              <Badge variant={campaign.status === "active" ? "success" : campaign.status === "draft" ? "outline" : campaign.status === "completed" ? "secondary" : "destructive"}>{campaign.status}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{campaign.objective}</p>
              <div className="flex flex-wrap gap-1 text-xs">
                <Badge variant="outline">{campaign.channel}</Badge>
                {campaign.startDate && <Badge variant="outline"><Calendar className="mr-1 h-3 w-3" />{new Date(campaign.startDate).toLocaleDateString()}</Badge>}
                {campaign.endDate && <Badge variant="outline"><CalendarDays className="mr-1 h-3 w-3" />{new Date(campaign.endDate).toLocaleDateString()}</Badge>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(campaign); setForm({...campaign, startDate: campaign.startDate ? campaign.startDate.split("T")[0] : "", endDate: campaign.endDate ? campaign.endDate.split("T")[0] : "" }); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(campaign.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}