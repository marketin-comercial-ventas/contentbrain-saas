"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useCompany } from "@/components/company-provider";
import { LayoutDashboard, Building2, Brain, Package, Users, MessageSquare, Target, Briefcase, BriefcaseBusiness } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Empresas", href: "/dashboard/companies", icon: Building2 },
  { name: "Company Brain", href: "/dashboard/brain", icon: Brain },
  { name: "Productos", href: "/dashboard/products", icon: Package },
  { name: "Audiencias", href: "/dashboard/audiences", icon: Users },
  { name: "Content Studio", href: "/dashboard/content", icon: MessageSquare },
  { name: "Campañas", href: "/dashboard/campaigns", icon: Target },
  { name: "Leads/CRM", href: "/dashboard/leads", icon: Briefcase },
  { name: "Talent/ATS", href: "/dashboard/talent", icon: BriefcaseBusiness },
];

interface CurrentUser {
  name: string;
  email: string;
}

function initials(user: CurrentUser | null) {
  if (!user) return "US";
  return user.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || user.email[0]?.toUpperCase() || "US";
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { companies, companyId, loading: companiesLoading, setCompanyId } = useCompany();
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [loggingOut, setLoggingOut] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { user?: CurrentUser } | null) => {
        if (!cancelled && data?.user) setUser(data.user);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar transition-all duration-200">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">CB</span>
          </div>
          <span className="text-xl font-semibold">ContentBrain</span>
        </div>

        <div className="border-b p-3">
          <label htmlFor="active-company" className="mb-1 block text-xs font-medium text-muted-foreground">
            Empresa activa
          </label>
          <select
            id="active-company"
            value={companyId ?? ""}
            disabled={companiesLoading || companies.length === 0}
            onChange={(event) => setCompanyId(event.target.value)}
            className="w-full rounded-md border bg-background px-2 py-2 text-sm"
          >
            {companies.length === 0 ? <option value="">Sin empresas</option> : null}
            {companies.map((company) => (
              <option key={company.id} value={company.id}>{company.name}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-2" aria-label="Main navigation">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full justify-start gap-2">
              <Avatar className="h-8 w-8" fallback={initials(user)} />
              <div className="flex-1 text-left">
                <p className="truncate text-sm font-medium">{user?.name ?? "Cargando usuario…"}</p>
                <p className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</p>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="px-2 py-1 text-sm font-medium">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1 text-sm font-medium">Configuración</DropdownMenuItem>
              <DropdownMenuItem
                className="px-2 py-1 text-sm font-medium text-destructive"
                aria-disabled={loggingOut}
                onClick={() => { if (!loggingOut) void handleLogout(); }}
              >
                {loggingOut ? "Cerrando sesión…" : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}
