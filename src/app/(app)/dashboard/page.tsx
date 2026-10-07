// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, FileText, Target, Briefcase, Building2, Brain, Package, MessageSquare } from "lucide-react";
import Link from "next/link";

interface DashboardMetrics {
  companies: Array<{ id: string; name: string; slug: string; stats: Record<string, number> }>;
  totals: Record<string, number>;
  leadPipeline: Record<string, number>;
  talentPipeline: Record<string, number>;
  recentContent: Array<{ id: string; type: string; createdAt: string }>;
  recentLeads: Array<{ id: string; name: string; status: string; createdAt: string }>;
  recentCandidates: Array<{ id: string; name: string; status: string; createdAt: string }>;
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const stats = [
    { label: "Empresas", value: metrics?.companies.length ?? 0, icon: Building2, color: "text-blue-500", href: "/dashboard/companies" },
    { label: "Productos", value: metrics?.totals.products ?? 0, icon: Package, color: "text-green-500", href: "/dashboard/products" },
    { label: "Audiencias", value: metrics?.totals.audiences ?? 0, icon: Users, color: "text-purple-500", href: "/dashboard/audiences" },
    { label: "Contenidos", value: metrics?.totals.content ?? 0, icon: FileText, color: "text-orange-500", href: "/dashboard/content" },
    { label: "Campañas", value: metrics?.totals.campaigns ?? 0, icon: Target, color: "text-pink-500", href: "/dashboard/campaigns" },
    { label: "Leads", value: metrics?.totals.leads ?? 0, icon: Briefcase, color: "text-indigo-500", href: "/dashboard/leads" },
    { label: "Vacantes", value: metrics?.totals.vacancies ?? 0, icon: Brain, color: "text-cyan-500", href: "/dashboard/talent" },
    { label: "Candidatos", value: metrics?.totals.candidates ?? 0, icon: Users, color: "text-emerald-500", href: "/dashboard/talent" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visión general de tu empresa</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={stat.color + " group-hover:scale-110 transition-transform"}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Pipeline de Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics?.leadPipeline ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{status}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Pipeline de Talento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics?.talentPipeline ?? {}).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="capitalize text-sm">{status.replace("_", " ")}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Empresas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.companies.slice(0, 5).map((company) => (
                <div key={company.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-xs text-muted-foreground">{company.slug}</p>
                  </div>
                  <Badge variant="outline">{company.stats.products ?? 0} productos</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Leads Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant={lead.status === "ganado" ? "success" : lead.status === "perdido" ? "destructive" : "secondary"}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base">Contenidos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics?.recentContent.slice(0, 5).map((content) => (
                <div key={content.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{content.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(content.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline">{content.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
