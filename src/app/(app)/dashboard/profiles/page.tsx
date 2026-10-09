"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, UserCog, Building2, Tag, Target, BarChart3 } from "lucide-react";
import { useCompany } from "@/components/company-provider";

const profileTypes = ["commercial", "talent", "hybrid"] as const;

interface Profile {
  id: string;
  name: string;
  type: string;
  description: string;
  brandId: string | null;
  branchId: string | null;
  responsibleUserId: string | null;
  settings: Record<string, unknown>;
  kpis: Record<string, unknown>;
  isActive: boolean;
}

interface Brand { id: string; name: string; }
interface Branch { id: string; name: string; }
interface User { id: string; name: string; email: string; }

export default function ProfilesPage() {
  const { companyId, loading: companyLoading } = useCompany();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);
  const [form, setForm] = useState({
    name: "", type: "commercial", description: "", brandId: "", branchId: "",
    responsibleUserId: "", settings: {}, kpis: {}, isActive: true,
  });

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/companies/${companyId}/profiles`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/brands`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/branches`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/users`).then(r => r.json()).catch(() => ({ users: [] })),
    ]).then(([p, b, br, u]) => { setProfiles(p.profiles); setBrands(b.brands); setBranches(br.branches); setUsers(u.users || []); setLoading(false); });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, brandId: form.brandId || null, branchId: form.branchId || null, responsibleUserId: form.responsibleUserId || null };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/profiles/${editing.id}` : `/api/companies/${companyId}/profiles`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setProfiles(profiles.map(p => p.id === editing.id ? result.profile : p));
      else setProfiles([...profiles, result.profile]);
      setShowForm(false); setEditing(null); resetForm();
    }
  };

  const handleDelete = async (id: string) => { if (!confirm("¿Eliminar este perfil?")) return; await fetch(`/api/companies/${companyId}/profiles/${id}`, { method: "DELETE" }); setProfiles(profiles.filter(p => p.id !== id)); };
  const resetForm = () => setForm({ name: "", type: "commercial", description: "", brandId: "", branchId: "", responsibleUserId: "", settings: {}, kpis: {}, isActive: true });

  if (companyLoading || loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!companyId) return <p className="text-muted-foreground">Selecciona una empresa para comenzar.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><UserCog className="text-primary" /> Perfiles Commercial/Talent</h1>
          <p className="text-muted-foreground">Perfiles de negocio por marca/sucursal</p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Nuevo Perfil</Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Perfil</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label>Tipo *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{profileTypes.map(t => <SelectItem key={t} value={t}>{t === "commercial" ? "Commercial" : t === "talent" ? "Talent" : "Híbrido"}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Marca</Label>
                  <Select value={form.brandId} onValueChange={(v) => setForm({...form, brandId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin marca" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin marca</SelectItem>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Sucursal</Label>
                  <Select value={form.branchId} onValueChange={(v) => setForm({...form, branchId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin sucursal" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin sucursal</SelectItem>{branches.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Responsable</Label>
                  <Select value={form.responsibleUserId} onValueChange={(v) => setForm({...form, responsibleUserId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin responsable" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin responsable</SelectItem>{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Activo</Label>
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
        {profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg">{profile.name}</CardTitle>
                <p className="text-sm text-muted-foreground capitalize">{profile.type}</p>
              </div>
              <Badge variant={profile.isActive ? "success" : "secondary"}>Activo</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{profile.description}</p>
              <div className="flex flex-wrap gap-1 text-xs">
                {profile.brandId && brands.find(b => b.id === profile.brandId) && <Badge variant="outline"><Tag className="mr-1 h-3 w-3" />{brands.find(b => b.id === profile.brandId)!.name}</Badge>}
                {profile.branchId && branches.find(b => b.id === profile.branchId) && <Badge variant="outline"><Building2 className="mr-1 h-3 w-3" />{branches.find(b => b.id === profile.branchId)!.name}</Badge>}
                <Badge variant="secondary">{profile.type === "commercial" ? "Commercial" : profile.type === "talent" ? "Talent" : "Híbrido"}</Badge>
              </div>
              <div className="flex gap-1 pt-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(profile); setForm({...profile}); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(profile.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}