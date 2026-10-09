"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CompanySummary {
  id: string;
  name: string;
  slug?: string;
}

interface CompanyContextValue {
  companies: CompanySummary[];
  company: CompanySummary | null;
  companyId: string | null;
  loading: boolean;
  error: string | null;
  setCompanyId: (companyId: string) => void;
  refreshCompanies: () => Promise<void>;
}

const ACTIVE_COMPANY_KEY = "contentbrain.activeCompanyId";
const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [companies, setCompanies] = useState<CompanySummary[]>([]);
  const [companyId, setCompanyIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/companies", { credentials: "include" });
      if (!response.ok) throw new Error("No se pudieron cargar las empresas");
      const data = (await response.json()) as { companies?: CompanySummary[] };
      const nextCompanies = Array.isArray(data.companies) ? data.companies : [];
      setCompanies(nextCompanies);
      setCompanyIdState((current) => {
        const saved = window.localStorage.getItem(ACTIVE_COMPANY_KEY);
        const preferred = current ?? saved;
        return nextCompanies.some((company) => company.id === preferred)
          ? preferred
          : nextCompanies[0]?.id ?? null;
      });
    } catch {
      setCompanies([]);
      setCompanyIdState(null);
      setError("No se pudieron cargar las empresas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshCompanies(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshCompanies]);

  useEffect(() => {
    if (companyId) window.localStorage.setItem(ACTIVE_COMPANY_KEY, companyId);
  }, [companyId]);

  const setCompanyId = useCallback((nextCompanyId: string) => {
    setCompanyIdState((current) => {
      if (current === nextCompanyId) return current;
      return companies.some((company) => company.id === nextCompanyId) ? nextCompanyId : current;
    });
  }, [companies]);

  const value = useMemo<CompanyContextValue>(() => ({
    companies,
    company: companies.find((item) => item.id === companyId) ?? null,
    companyId,
    loading,
    error,
    setCompanyId,
    refreshCompanies,
  }), [companies, companyId, loading, error, setCompanyId, refreshCompanies]);

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) throw new Error("useCompany debe utilizarse dentro de CompanyProvider");
  return context;
}
