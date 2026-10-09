// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Briefcase, Users, Mail, Phone, ArrowRight, ArrowLeft, Filter } from "lucide-react";
import { useCompany } from "@/components/company-provider";

const sources = ["website", "facebook", "instagram", "linkedin", "referral", "cold_call", "email", "event", "ads", "organic", "otro"] as const;
const statuses = ["nuevo", "contactado", "calificado", "propuesta", "ganado", "perdido"] as const;

interface Lead {
  id: string;
  name: string;
  phone: string;
  email: string;
  company: string;
  source: string;
  status: string;
  assignedTo: string | null;
  notes: string;
  value: number;
}

export default function LeadsPage() {
  const { companyId, loading: companyLoading } = useCompany();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Lead | null>(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    source: "organic",
    status: "nuevo",
    assignedTo: "",
    notes: "",
    value: 0,
  });
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    const url = filterStatus ? `/api/companies/${companyId}/leads?status=${filterStatus}` : `/api/companies/${companyId}/leads`;
    fetch(url).then(r => r.json()).then(data => { setLeads(data.leads); setLoading(false); });
  }, [companyId, filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, value: Number(form.value), assignedTo: form.assignedTo || null };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/leads/${editing.id}` : `/api/companies/${companyId}/leads`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setLeads(leads.map(l => l.id === editing.id ? result.lead : l));
      else setLeads([...leads, result.lead]);
      setShowForm(false);
      setEditing(null);
      resetForm();
    }
  };

  const handleMove = async (id: string, status: string) => {
    const res = await fetch(`/api/companies/${companyId}/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moveOnly: true, status }),
    });
    if (res.ok) {
      const result = await res.json();
      setLeads(leads.map(l => l.id === id ? result.lead : l));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este lead?")) return;
    await fetch(`/api/companies/${companyId}/leads/${id}`, { method: "DELETE" });
    setLeads(leads.filter(l => l.id !== id));
  };

  const resetForm = () => setForm({ name: "", phone: "", email: "", company: "", source: "organic", status: "nuevo", assignedTo: "", notes: "", value: 0 });

  if (companyLoading || loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!companyId) return <p className="text-muted-foreground">Selecciona una empresa para comenzar.</p>;

  const leadsByStatus = statuses.reduce((acc, s) => ({ ...acc, [s]: leads.filter(l => l.status === s) }), {} as Record<string, Lead[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Briefcase className="text-primary" /> Leads / CRM</h1>
          <p className="text-muted-foreground">Pipeline de ventas y gestión de contactos</p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Nuevo Lead</Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Filtrar por estado" /></SelectTrigger>
          <SelectContent><SelectItem value="">Todos</SelectItem>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {showForm && (
        <Card className="border-primary fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md bg-background rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
            <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Lead</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                  <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                  <div className="space-y-2"><Label htmlFor="company">Empresa</Label><Input id="company" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} /></div>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2"><Label>Fuente</Label>
                    <Select value={form.source} onValueChange={(v) => setForm({...form, source: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{sources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Estado</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({...form, status: v as any})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label htmlFor="value">Valor ($)</Label><Input id="value" type="number" value={form.value} onChange={(e) => setForm({...form, value: Number(e.target.value)})} /></div>
                </div>
                <div className="space-y-2"><Label htmlFor="notes">Notas</Label><textarea className="w-full min-h-[80px] p-3 border rounded" value={form.notes} onChange={(e) => setForm({...form, notes: e.target.value})} /></div>
                <div className="flex gap-2">
                  <Button type="submit">{editing ? "Actualizar" : "Crear"}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditing(null); resetForm(); }}>Cancelar</Button>
                </div>
              </form>
            </CardContent>
          </div>
        </Card>
      )}

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 h-[calc(100vh-300px)] overflow-y-auto">
            {statuses.map((status) => (
              <Card key={status} className="flex flex-col h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="capitalize text-sm">{status}</CardTitle>
                    <Badge variant="secondary">{leadsByStatus[status]?.length ?? 0}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-2 p-0">
                  {leadsByStatus[status]?.map((lead) => (
                    <Card key={lead.id} className="m-2 p-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setEditing(lead); setForm({...lead, value: lead.value}); setShowForm(true); }}>
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-xs text-muted-foreground">{lead.company || "Sin empresa"}</p>
                      <div className="flex gap-1 mt-2">
                        <Badge variant="outline">{lead.source}</Badge>
                        {lead.value > 0 && <Badge variant="secondary">${lead.value.toLocaleString()}</Badge>}
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-2">
            {leads.map((lead) => (
              <Card key={lead.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.company || "Sin empresa"} · {lead.email || "Sin email"}</p>
                  </div>
                  <Badge variant={lead.status === "ganado" ? "success" : lead.status === "perdido" ? "destructive" : "secondary"}>{lead.status}</Badge>
                  <Badge variant="outline">{lead.source}</Badge>
                  {lead.value > 0 && <Badge variant="secondary">${lead.value.toLocaleString()}</Badge>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(lead); setForm({...lead, value: lead.value}); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}