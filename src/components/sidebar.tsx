"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LayoutDashboard, Building2, Brain, Package, Users, MessageSquare, Target, FileText, Briefcase, BriefcaseBusiness } from "lucide-react";

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

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-sidebar transition-all duration-200">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">CB</span>
          </div>
          <span className="text-xl font-semibold">ContentBrain</span>
        </div>

        <nav className="flex-1 space-y-1 p-2" aria-label="Main navigation">
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
            <DropdownMenuTrigger>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Avatar className="h-8 w-8" fallback="US" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium truncate">Usuario Demo</p>
                  <p className="text-xs text-muted-foreground truncate">demo@empresa.com</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem className="px-2 py-1 text-sm font-medium">Perfil</DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1 text-sm font-medium">Configuración</DropdownMenuItem>
              <DropdownMenuItem className="px-2 py-1 text-sm font-medium text-destructive" onClick={() => window.location.href = "/api/auth/logout"}>
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </aside>
  );
}