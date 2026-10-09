// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Users, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCompany } from "@/components/company-provider";

interface Company {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  primaryColor: string;
  secondaryColor: string;
  members?: Array<{ user: { name: string; email: string }; role: string }>;
  stats?: Record<string, number>;
}

export default function CompaniesPage() {
  const { refreshCompanies } = useCompany();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    fetch("/api/companies")
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data.companies);
        setLoading(false);
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      const data = await res.json();
      setCompanies([...companies, data.company]);
      await refreshCompanies();
      setName("");
      setShowForm(false);
    }
  };

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">Gestiona tus empresas y membresías</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="mr-2 h-4 w-4" />Nueva Empresa</Button>
      </div>

      {showForm && (
        <Card className="border-primary">
          <CardHeader><CardTitle>Crear Empresa</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mi Empresa" required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Crear</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="group">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <div className="flex gap-1">
                <Link href={`/dashboard/companies/${company.id}`}><Button variant="ghost" size="icon"><Building2 className="h-4 w-4" /></Button></Link>
                <Button variant="ghost" size="icon" onClick={() => console.log("delete", company.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">Slug: {company.slug}</p>
                <p className="text-muted-foreground">Colores: <span className="font-medium">{company.primaryColor}</span> / <span className="font-medium">{company.secondaryColor}</span></p>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{company.members?.length ?? 0} miembros</span>
                </div>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline">{company.stats?.products ?? 0} productos</Badge>
                  <Badge variant="outline">{company.stats?.audiences ?? 0} audiencias</Badge>
                  <Badge variant="outline">{company.stats?.leads ?? 0} leads</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}