"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Save, RefreshCw, Check, X } from "lucide-react";

interface CompanyBrain {
  id: string;
  name: string;
  description: string;
  industry: string;
  valueProposition: string;
  targetAudience: string;
  tone: string;
  website: string;
  whatsapp: string;
  socialLinkedin: string;
  socialInstagram: string;
  socialTwitter: string;
  socialFacebook: string;
  socialTiktok: string;
  products: string[];
  services: string[];
  version: number;
  createdBy: string | null;
  approvedBy: string | null;
  isApproved: boolean;
}

const defaultBrain: CompanyBrain = {
  id: "",
  name: "",
  description: "",
  industry: "",
  valueProposition: "",
  targetAudience: "",
  tone: "profesional",
  website: "",
  whatsapp: "",
  socialLinkedin: "",
  socialInstagram: "",
  socialTwitter: "",
  socialFacebook: "",
  socialTiktok: "",
  products: [],
  services: [],
  version: 1,
  createdBy: null,
  approvedBy: null,
  isApproved: false,
};

export default function BrainPage() {
  const { companyId, loading: companyLoading } = useCompany();
  const [brain, setBrain] = useState<CompanyBrain>(defaultBrain);
  const [versions, setVersions] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      if (!companyId) {
        if (!ignore) {
          setBrain(defaultBrain);
          setVersions([]);
          setLoading(false);
          setVersionsLoading(false);
        }
        return;
      }
      if (!ignore) setLoading(true);
      if (!ignore) setVersionsLoading(true);
      try {
        // Fetch brain
        const brainRes = await fetch(`/api/companies/${companyId}/brain`);
        const brainData = await brainRes.json();
        // Fetch versions
        const versionsRes = await fetch(`/api/companies/${companyId}/brain/versions`);
        const versionsData = await versionsRes.json();
        if (!ignore) {
          setBrain(brainData.brain ?? defaultBrain);
          setVersions(versionsData.versions ?? []);
        }
      } catch (error) {
        console.error('Error fetching brain data:', error);
        if (!ignore) {
          setBrain(defaultBrain);
          setVersions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setVersionsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      ignore = true;
    };
  }, [companyId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/brain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(brain),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al guardar");
      }
      // Refetch brain and versions after save
      const brainRes = await fetch(`/api/companies/${companyId}/brain`);
      const brainData = await brainRes.json();
      const versionsRes = await fetch(`/api/companies/${companyId}/brain/versions`);
      const versionsData = await versionsRes.json();
      setBrain(brainData.brain ?? defaultBrain);
      setVersions(versionsData.versions ?? []);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    setApproveLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/brain/approve`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al aprobar");
      }
      // Refetch brain after approval
      const brainRes = await fetch(`/api/companies/${companyId}/brain`);
      const brainData = await brainRes.json();
      setBrain(brainData.brain ?? defaultBrain);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setApproveLoading(false);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/companies/${companyId}/brain/reject`, {
        method: "POST",
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Error al rechazar");
      }
      // Refetch brain after rejection
      const brainRes = await fetch(`/api/companies/${companyId}/brain`);
      const brainData = await brainRes.json();
      setBrain(brainData.brain ?? defaultBrain);
    } catch (err: any) {
      setError(err.message || "Error desconocido");
    } finally {
      setRejectLoading(false);
    }
  };

  if (companyLoading || loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!companyId) return <p className="text-muted-foreground">Selecciona una empresa para comenzar.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="text-primary" /> Company Brain
          </h1>
          <p className="text-muted-foreground">Configura la identidad y conocimiento de tu empresa para la IA</p>
        </div>
        {/* Approval status and actions */}
        <div className="flex items-center gap-4 text-sm">
          {brain.isApproved ? (
            <>
              <span className="text-green-600">Aprobado</span>
              {!approveLoading && !rejectLoading && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReject}
                  disabled={rejectLoading}
                  className="text-red-600 hover:text-red-800"
                >
                  {rejectLoading ? "Rechazando..." : "Rechazar"}
                  <X className="mr-2 h-4 w-4" />
                </Button>
              )}
            </>
          ) : (
            <>
              <span className="text-yellow-600">Borrador</span>
              {!approveLoading && !rejectLoading && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleApprove}
                  disabled={approveLoading}
                >
                  {approveLoading ? "Aprobando..." : "Aprobar"}
                  <Check className="mr-2 h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 mb-4 bg-red-50 border-l-4 border-red-200 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList>
            <TabsTrigger value="identity">Identidad</TabsTrigger>
            <TabsTrigger value="offer">Oferta</TabsTrigger>
            <TabsTrigger value="audience">Audiencia</TabsTrigger>
            <TabsTrigger value="channels">Canales</TabsTrigger>
            <TabsTrigger value="brand">Marca</TabsTrigger>
          </TabsList>

          <TabsContent value="identity" className="space-y-4">
            <Card><CardHeader><CardTitle>Información Básica</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="name">Nombre de la empresa</Label><Input id="name" value={brain.name} onChange={(e) => setBrain({...brain, name: e.target.value})} placeholder="Mi Empresa" /></div>
                <div className="space-y-2"><Label htmlFor="industry">Industria</Label><Input id="industry" value={brain.industry} onChange={(e) => setBrain({...brain, industry: e.target.value})} placeholder="Tecnología / SaaS" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="description">Descripción</Label><Input id="description" value={brain.description} onChange={(e) => setBrain({...brain, description: e.target.value})} placeholder="Describe tu empresa..." /></div>
              <div className="space-y-2"><Label htmlFor="tone">Tono de comunicación</Label><Input id="tone" value={brain.tone} onChange={(e) => setBrain({...brain, tone: e.target.value})} placeholder="profesional, cercano, experto, inspirador..." /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="offer" className="space-y-4">
            <Card><CardHeader><CardTitle>Propuesta de Valor</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="space-y-2"><Label htmlFor="valueProposition">Propuesta de valor principal</Label><Input id="valueProposition" value={brain.valueProposition} onChange={(e) => setBrain({...brain, valueProposition: e.target.value})} placeholder="¿Por qué te eligen?" /></div>
              <div className="space-y-2"><Label htmlFor="targetAudience">Audiencia objetivo general</Label><Input id="targetAudience" value={brain.targetAudience} onChange={(e) => setBrain({...brain, targetAudience: e.target.value})} placeholder="Ej: PYMEs que buscan automatizar marketing" /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-4">
            <Card><CardHeader><CardTitle>Productos y Servicios (para contexto IA)</CardTitle></CardHeader><CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Estos se usan como contexto al generar contenido. Se sincronizan automáticamente con el módulo Productos.</p>
              <div className="space-y-2">
                <Label>Productos (uno por línea)</Label>
                <textarea className="w-full min-h-[100px] p-3 border rounded" value={brain.products?.join("\n") || ""} onChange={(e) => setBrain({...brain, products: e.target.value.split("\n").filter(Boolean)})} />
              </div>
              <div className="space-y-2">
                <Label>Servicios (uno por línea)</Label>
                <textarea className="w-full min-h-[100px] p-3 border rounded" value={brain.services?.join("\n") || ""} onChange={(e) => setBrain({...brain, services: e.target.value.split("\n").filter(Boolean)})} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="channels" className="space-y-4">
            <Card><CardHeader><CardTitle>Canales de Contacto</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="website">Sitio Web</Label><Input id="website" type="url" value={brain.website} onChange={(e) => setBrain({...brain, website: e.target.value})} placeholder="https://miempresa.com" /></div>
              <div className="space-y-2"><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" value={brain.whatsapp} onChange={(e) => setBrain({...brain, whatsapp: e.target.value})} placeholder="+54 9 11 1234 5678" /></div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="brand" className="space-y-4">
            <Card><CardHeader><CardTitle>Redes Sociales</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="socialLinkedin">LinkedIn</Label><Input id="socialLinkedin" type="url" value={brain.socialLinkedin} onChange={(e) => setBrain({...brain, socialLinkedin: e.target.value})} placeholder="https://linkedin.com/company/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialInstagram">Instagram</Label><Input id="socialInstagram" type="url" value={brain.socialInstagram} onChange={(e) => setBrain({...brain, socialInstagram: e.target.value})} placeholder="https://instagram.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialTwitter">Twitter/X</Label><Input id="socialTwitter" type="url" value={brain.socialTwitter} onChange={(e) => setBrain({...brain, socialTwitter: e.target.value})} placeholder="https://twitter.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialFacebook">Facebook</Label><Input id="socialFacebook" type="url" value={brain.socialFacebook} onChange={(e) => setBrain({...brain, socialFacebook: e.target.value})} placeholder="https://facebook.com/..." /></div>
              <div className="space-y-2"><Label htmlFor="socialTiktok">TikTok</Label><Input id="socialTiktok" type="url" value={brain.socialTiktok} onChange={(e) => setBrain({...brain, socialTiktok: e.target.value})} placeholder="https://tiktok.com/@..." /></div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2">
          <Button type="submit" disabled={saving}><Save className="mr-2 h-4 w-4" />{saving ? "Guardando..." : "Guardar Cambios"}</Button>
          <Button type="button" variant="outline" onClick={() => window.location.reload()}><RefreshCw className="mr-2 h-4 w-4" />Recargar</Button>
        </div>
      </div>

      {/* Versions history */}
      <div className="border-t pt-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Check className="text-primary" /> Historial de Versiones
        </h2>
        {versionsLoading ? (
          <div className="animate-spin h-8 w-8 mx-auto">Cargando historial...</div>
        ) : (
          <div className="space-y-4">
            {versions.length === 0 ? (
              <p className="text-muted-foreground">No hay versiones históricas aún.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Versión</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creada por</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {versions.map((v, index) => (
                      <tr key={v.id || index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.version}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {v.createdBy ?? "Sistema"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(v.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {/* Here we could add a button to view or restore this version */}
                          <Button variant="ghost" size="xs" className="text-primary">
                            Ver
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}