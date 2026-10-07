"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Building2, MapPin, Phone, Mail, MapPinCheck } from "lucide-react";
import { useParams } from "next/navigation";

const branchTypes = ["sede", "sucursal", "oficina", "almacen", "punto_venta", "otro"] as const;

interface Branch {
  id: string;
  name: string;
  code: string;
  type: string;
  brandId: string | null;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  latitude: string;
  longitude: string;
  openingHours: Record<string, unknown>;
  isActive: boolean;
  isHeadquarters: boolean;
}

interface Brand { id: string; name: string; }

export default function BranchesPage() {
  const params = useParams();
  const companyId = params.companyId as string;
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [form, setForm] = useState({
    name: "", code: "", type: "sucursal", brandId: "",
    address: "", city: "", state: "", country: "Argentina",
    postalCode: "", phone: "", email: "",
    latitude: "", longitude: "", isActive: true, isHeadquarters: false,
    openingHours: {},
  });

  useEffect(() => {
    Promise.all([
      fetch(`/api/companies/${companyId}/branches`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/brands`).then(r => r.json()),
    ]).then(([b, br]) => { setBranches(b.branches); setBrands(br.brands); setLoading(false); });
  }, [companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form, brandId: form.brandId || null };
    const method = editing ? "PATCH" : "POST";
    const url = editing ? `/api/companies/${companyId}/branches/${editing.id}` : `/api/companies/${companyId}/branches`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editing) setBranches(branches.map(b => b.id === editing.id ? result.branch : b));
      else setBranches([...branches, result.branch]);
      setShowForm(false); setEditing(null); resetForm();
    }
  };

  const handleDelete = async (id: string) => { if (!confirm("¿Eliminar esta sucursal?")) return; await fetch(`/api/companies/${companyId}/branches/${id}`, { method: "DELETE" }); setBranches(branches.filter(b => b.id !== id)); };
  const resetForm = () => setForm({ name: "", code: "", type: "sucursal", brandId: "", address: "", city: "", state: "", country: "Argentina", postalCode: "", phone: "", email: "", latitude: "", longitude: "", isActive: true, isHeadquarters: false, openingHours: {} });

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><Building2 className="text-primary" /> Sucursales</h1>
          <p className="text-muted-foreground">Gestiona las ubicaciones físicas de tu empresa</p>
        </div>
        <Button onClick={() => { resetForm(); setEditing(null); setShowForm(true); }}><Plus className="mr-2 h-4 w-4" />Nueva Sucursal</Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>{editing ? "Editar" : "Crear"} Sucursal</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-3xl">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre *</Label><Input id="name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required /></div>
                <div className="space-y-2"><Label htmlFor="code">Código *</Label><Input id="code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value})} required placeholder="SUC-001" /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label>Tipo</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({...form, type: v as any})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{branchTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label>Marca</Label>
                  <Select value={form.brandId} onValueChange={(v) => setForm({...form, brandId: v})}>
                    <SelectTrigger><SelectValue placeholder="Sin marca" /></SelectTrigger>
                    <SelectContent><SelectItem value="">Sin marca</SelectItem>{brands.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2"><Label htmlFor="isHeadquarters">Sede Principal</Label>
                  <Select value={form.isHeadquarters.toString()} onValueChange={(v) => setForm({...form, isHeadquarters: v === "true"})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="true">Sí</SelectItem><SelectItem value="false">No</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2"><Label htmlFor="address">Dirección</Label><Input id="address" value={form.address} onChange={(e) => setForm({...form, address: e.target.value})} /></div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="city">Ciudad</Label><Input id="city" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="state">Estado/Provincia</Label><Input id="state" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="country">País</Label><Input id="country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2"><Label htmlFor="postalCode">Código Postal</Label><Input id="postalCode" value={form.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="phone">Teléfono</Label><Input id="phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} /></div>
                <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} /></div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="isActive">Activa</Label>
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
        {branches.map((branch) => (
          <Card key={branch.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <MapPinCheck className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{branch.name}</CardTitle>
                {branch.isHeadquarters && <Badge variant="default">SEDE</Badge>}
              </div>
              <Badge variant={branch.isActive ? "success" : "secondary"}>{branch.type}</Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">{branch.code}</p>
              <div className="flex flex-wrap gap-1 text-xs">
                <Badge variant="outline"><MapPin className="mr-1 h-3 w-3" />{branch.city}, {branch.state}</Badge>
                {branch.phone && <Badge variant="outline"><Phone className="mr-1 h-3 w-3" />{branch.phone}</Badge>}
                {branch.email && <Badge variant="outline"><Mail className="mr-1 h-3 w-3" />{branch.email}</Badge>}
                <Badge variant="secondary">{branch.isActive ? "Activa" : "Inactiva"}</Badge>
              </div>
              <div className="flex gap-1 pt-2">
                <Button variant="ghost" size="icon" onClick={() => { setEditing(branch); setForm({ name: branch.name, code: branch.code, type: branch.type, brandId: branch.brandId || "", address: branch.address || "", city: branch.city || "", state: branch.state || "", country: branch.country || "Argentina", postalCode: branch.postalCode || "", phone: branch.phone || "", email: branch.email || "", latitude: branch.latitude || "", longitude: branch.longitude || "", isActive: branch.isActive, isHeadquarters: branch.isHeadquarters, openingHours: branch.openingHours || {} }); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}