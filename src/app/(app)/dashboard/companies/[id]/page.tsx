// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Brain, Package, MessageSquare, Target, Briefcase, Building2, Edit } from "lucide-react";
import { useParams } from "next/navigation";

interface CompanyDetail {
  id: string;
  name: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  members: Array<{ user: { name: string; email: string }; role: string }>;
  stats: Record<string, number>;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params.id as string;
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/companies/${companyId}`)
      .then((res) => res.json())
      .then((data) => {
        setCompany(data.company);
        setLoading(false);
      });
  }, [companyId]);

  if (loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!company) return <div>Empresa no encontrada</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
          <p className="text-muted-foreground">Slug: {company.slug}</p>
        </div>
        <Button asChild><span className="text-sm">Editar</span></Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="members">Miembros ({company.members.length})</TabsTrigger>
          <TabsTrigger value="brain">Company Brain</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="audiences">Audiencias</TabsTrigger>
          <TabsTrigger value="content">Contenidos</TabsTrigger>
          <TabsTrigger value="campaigns">Campañas</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
          <TabsTrigger value="talent">Talent</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-3">
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Productos</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.products ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Audiencias</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.audiences ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Campañas</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.campaigns ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Contenidos</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.content ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Leads</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.leads ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Vacantes</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.vacancies ?? 0}</CardContent></Card>
            <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Candidatos</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{company.stats.candidates ?? 0}</CardContent></Card>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Miembros</h3>
              <Button size="sm" variant="outline"><Plus className="mr-2 h-4 w-4" />Invitar</Button>
            </div>
            <div className="space-y-2">
              {company.members.map((member) => (
                <Card key={member.user.email} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">{member.user.name[0].toUpperCase()}</div>
                    <div>
                      <p className="font-medium">{member.user.name}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  <Badge variant={member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"}>
                    {member.role}
                  </Badge>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="brain">
          <p className="text-muted-foreground">Configura el Company Brain en la pestaña dedicada</p>
          <Button asChild><span>Ir a Company Brain</span></Button>
        </TabsContent>

        <TabsContent value="products">
          <p className="text-muted-foreground">Gestiona productos desde la pestaña Productos</p>
        </TabsContent>

        <TabsContent value="audiences">
          <p className="text-muted-foreground">Gestiona audiencias desde la pestaña Audiencias</p>
        </TabsContent>

        <TabsContent value="content">
          <p className="text-muted-foreground">Genera contenido en Content Studio</p>
        </TabsContent>

        <TabsContent value="campaigns">
          <p className="text-muted-foreground">Gestiona campañas</p>
        </TabsContent>

        <TabsContent value="leads">
          <p className="text-muted-foreground">CRM de Leads</p>
        </TabsContent>

        <TabsContent value="talent">
          <p className="text-muted-foreground">ATS y Vacantes</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}