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
import { Plus, Edit, Trash2, BriefcaseBusiness, UserPlus, User, Mail, Phone, DollarSign, MapPin, Briefcase } from "lucide-react";
import { useCompany } from "@/components/company-provider";

const modalities = ["presencial", "hibrido", "remoto"] as const;
const jobStatuses = ["draft", "published", "paused", "closed", "filled"] as const;
const candidateStatuses = ["nuevo", "preseleccion", "contacto", "entrevista", "finalista", "oferta", "contratado", "rechazado"] as const;
const currencies = ["USD", "EUR", "MXN", "ARS", "COP", "CLP", "PEN"] as const;

interface Vacancy {
  id: string;
  title: string;
  description: string;
  location: string;
  modality: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string;
  requirements: string[];
  status: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  cvUrl: string;
  experience: string;
  skills: string[];
  source: string;
  status: string;
  vacancyId: string | null;
}

export default function TalentPage() {
  const { companyId, loading: companyLoading } = useCompany();
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"vacancies" | "candidates">("vacancies");
  const [showForm, setShowForm] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [vacancyForm, setVacancyForm] = useState({
    title: "", description: "", location: "", modality: "hibrido",
    salaryMin: 0, salaryMax: 0, currency: "USD", requirements: "", status: "draft",
  });
  const [candidateForm, setCandidateForm] = useState({
    name: "", email: "", phone: "", cvUrl: "", experience: "", skills: "", source: "direct", status: "nuevo", vacancyId: "",
  });

  useEffect(() => {
    if (!companyId) { setLoading(false); return; }
    Promise.all([
      fetch(`/api/companies/${companyId}/vacancies`).then(r => r.json()),
      fetch(`/api/companies/${companyId}/candidates`).then(r => r.json()),
    ]).then(([v, c]) => { setVacancies(v.vacancies); setCandidates(c.candidates); setLoading(false); });
  }, [companyId]);

  const handleVacancySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...vacancyForm, salaryMin: vacancyForm.salaryMin || null, salaryMax: vacancyForm.salaryMax || null, requirements: vacancyForm.requirements.split("\n").filter(Boolean) };
    const method = editingVacancy ? "PATCH" : "POST";
    const url = editingVacancy ? `/api/companies/${companyId}/vacancies/${editingVacancy.id}` : `/api/companies/${companyId}/vacancies`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editingVacancy) setVacancies(vacancies.map(v => v.id === editingVacancy.id ? result.vacancy : v));
      else setVacancies([...vacancies, result.vacancy]);
      closeVacancyForm();
    }
  };

  const handleCandidateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...candidateForm, skills: candidateForm.skills.split("\n").filter(Boolean), vacancyId: candidateForm.vacancyId || null };
    const method = editingCandidate ? "PATCH" : "POST";
    const url = editingCandidate ? `/api/companies/${companyId}/candidates/${editingCandidate.id}` : `/api/companies/${companyId}/candidates`;
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    if (res.ok) {
      const result = await res.json();
      if (editingCandidate) setCandidates(candidates.map(c => c.id === editingCandidate.id ? result.candidate : c));
      else setCandidates([...candidates, result.candidate]);
      closeCandidateForm();
    }
  };

  const handleDeleteVacancy = async (id: string) => { if (!confirm("¿Eliminar vacante?")) return; await fetch(`/api/companies/${companyId}/vacancies/${id}`, { method: "DELETE" }); setVacancies(vacancies.filter(v => v.id !== id)); };
  const handleDeleteCandidate = async (id: string) => { if (!confirm("¿Eliminar candidato?")) return; await fetch(`/api/companies/${companyId}/candidates/${id}`, { method: "DELETE" }); setCandidates(candidates.filter(c => c.id !== id)); };
  const handleMoveCandidate = async (id: string, status: string) => {
    await fetch(`/api/companies/${companyId}/candidates/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ moveOnly: true, status }) });
    setCandidates(candidates.map(c => c.id === id ? { ...c, status } : c));
  };

  const closeVacancyForm = () => { setShowForm(false); setEditingVacancy(null); setVacancyForm({ title: "", description: "", location: "", modality: "hibrido", salaryMin: 0, salaryMax: 0, currency: "USD", requirements: "", status: "draft" }); };
  const closeCandidateForm = () => { setShowForm(false); setEditingCandidate(null); setCandidateForm({ name: "", email: "", phone: "", cvUrl: "", experience: "", skills: "", source: "direct", status: "nuevo", vacancyId: "" }); };

  if (companyLoading || loading) return <div className="animate-spin h-8 w-8 border-b-2 border-primary" />;
  if (!companyId) return <p className="text-muted-foreground">Selecciona una empresa para comenzar.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2"><BriefcaseBusiness className="text-primary" /> Talent / ATS</h1>
          <p className="text-muted-foreground">Gestión de vacantes y candidatos</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => {
            if (activeTab === "vacancies") {
              setEditingVacancy(null);
              setVacancyForm({ title: "", description: "", location: "", modality: "hibrido", salaryMin: 0, salaryMax: 0, currency: "USD", requirements: "", status: "draft" });
            } else {
              setEditingCandidate(null);
              setCandidateForm({ name: "", email: "", phone: "", cvUrl: "", experience: "", skills: "", source: "direct", status: "nuevo", vacancyId: "" });
            }
            setShowForm(true);
          }}>
            <Plus className="mr-2 h-4 w-4" />{activeTab === "vacancies" ? "Nueva Vacante" : "Nuevo Candidato"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="vacancies"><BriefcaseBusiness className="mr-2 h-4 w-4" />Vacantes ({vacancies.length})</TabsTrigger>
          <TabsTrigger value="candidates"><UserPlus className="mr-2 h-4 w-4" />Candidatos ({candidates.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="vacancies">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Vacantes</h3>
            <Button onClick={() => { setEditingVacancy(null); setVacancyForm({ title: "", description: "", location: "", modality: "hibrido", salaryMin: 0, salaryMax: 0, currency: "USD", requirements: "", status: "draft" }); setShowForm(true); }}>
              <Plus className="mr-2 h-4 w-4" />Nueva Vacante
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vacancies.map((vacancy) => (
              <Card key={vacancy.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">{vacancy.title}</CardTitle>
                  <Badge variant={vacancy.status === "published" ? "success" : vacancy.status === "draft" ? "outline" : "secondary"}>{vacancy.status}</Badge>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">{vacancy.description?.slice(0, 100)}...</p>
                  <div className="flex flex-wrap gap-1 text-xs">
                    <Badge variant="outline"><MapPin className="mr-1 h-3 w-3" />{vacancy.location || "Sin ubicación"}</Badge>
                    <Badge variant="outline">{vacancy.modality}</Badge>
                    {vacancy.salaryMin && vacancy.salaryMax && <Badge variant="secondary">{vacancy.currency} {vacancy.salaryMin.toLocaleString()} - {vacancy.salaryMax.toLocaleString()}</Badge>}
                    <Badge variant="outline">{vacancy.requirements.length} requisitos</Badge>
                  </div>
                  <div className="flex gap-1 pt-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingVacancy(vacancy); setVacancyForm({ title: vacancy.title, description: vacancy.description, location: vacancy.location, modality: vacancy.modality, salaryMin: vacancy.salaryMin || 0, salaryMax: vacancy.salaryMax || 0, currency: vacancy.currency, requirements: vacancy.requirements.join("\n"), status: vacancy.status }); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteVacancy(vacancy.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="candidates">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Candidatos</h3>
            <Button onClick={() => { setEditingCandidate(null); setCandidateForm({ name: "", email: "", phone: "", cvUrl: "", experience: "", skills: "", source: "direct", status: "nuevo", vacancyId: "" }); setShowForm(true); }}>
              <UserPlus className="mr-2 h-4 w-4" />Nuevo Candidato
            </Button>
          </div>
          <Tabs defaultValue="kanban" className="space-y-4">
            <TabsList>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
              <TabsTrigger value="list">Lista</TabsTrigger>
            </TabsList>

            <TabsContent value="kanban">
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:grid-cols-8 h-[calc(100vh-300px)] overflow-y-auto">
                {candidateStatuses.map((status) => (
                  <Card key={status} className="flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="capitalize text-sm">{status.replace("_", " ")}</CardTitle>
                        <Badge variant="secondary">{candidates.filter(c => c.status === status).length}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto space-y-2 p-0">
                      {candidates.filter(c => c.status === status).map((candidate) => (
                        <Card key={candidate.id} className="m-2 p-3 cursor-pointer hover:shadow-md" onClick={() => { setEditingCandidate(candidate); setCandidateForm({...candidate, skills: candidate.skills.join("\n")}); setShowForm(true); }}>
                          <p className="font-medium">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground">{candidate.email || "Sin email"}</p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {candidate.skills.slice(0, 3).map(s => <Badge key={s} variant="outline">{s}</Badge>)}
                            {candidate.skills.length > 3 && <Badge variant="secondary">+{candidate.skills.length - 3}</Badge>}
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
                {candidates.map((candidate) => (
                  <Card key={candidate.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{candidate.name}</p>
                        <p className="text-sm text-muted-foreground">{candidate.email} · {candidate.phone || "Sin teléfono"}</p>
                      </div>
                      <Badge variant="secondary">{candidate.status.replace("_", " ")}</Badge>
                      <Badge variant="outline">{candidate.source}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => { setEditingCandidate(candidate); setCandidateForm({...candidate, skills: candidate.skills.join("\n")}); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteCandidate(candidate.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}