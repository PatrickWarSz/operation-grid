import { createFileRoute, Outlet, Link, useNavigate, useLocation, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  Package,
  CreditCard,
  Megaphone,
  Wallet,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/clientes", label: "Clientes", icon: Users, exact: false },
  { to: "/admin/planos", label: "Planos", icon: CreditCard, exact: false },
  { to: "/admin/modulos", label: "Módulos", icon: Package, exact: false },
  { to: "/admin/financeiro", label: "Financeiro", icon: Wallet, exact: false },
  { to: "/admin/usuarios", label: "Usuários", icon: ShieldCheck, exact: false },
  { to: "/admin/novidades", label: "Novidades", icon: Megaphone, exact: false },
] as const;

function AdminLayout() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login", search: { redirect: location.pathname } as any });
      return;
    }
    void (async () => {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      setIsAdmin(!!data);
    })();
  }, [loading, user, navigate, location.pathname]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-400">
        <span className="text-sm">verificando permissões...</span>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-6">
        <ShieldCheck className="h-12 w-12 text-zinc-600 mb-4" />
        <h1 className="text-xl font-semibold">Acesso restrito</h1>
        <p className="text-sm text-zinc-400 mt-2 text-center max-w-md">
          Este painel é exclusivo para administradores do sistema.
        </p>
        <Link
          to="/app"
          className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm transition"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar pro workspace
        </Link>
      </div>
    );
  }

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex w-64 flex-col bg-zinc-900 border-r border-zinc-800 sticky top-0 h-screen">
          <SidebarContent
            isActive={isActive}
            onSignOut={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          />
        </aside>

        {/* Sidebar mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/70" onClick={() => setMobileOpen(false)} />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col">
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end p-3 text-zinc-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent
                isActive={isActive}
                onClick={() => setMobileOpen(false)}
                onSignOut={async () => {
                  await signOut();
                  navigate({ to: "/" });
                }}
              />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 bg-zinc-900/80 backdrop-blur border-b border-zinc-800">
            <div className="flex items-center justify-between px-4 sm:px-6 h-14">
              <div className="flex items-center gap-3">
                <button
                  className="lg:hidden p-2 text-zinc-400 hover:text-white"
                  onClick={() => setMobileOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </button>
                <span className="text-[10px] font-bold tracking-widest text-amber-400 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                  PAINEL DO SISTEMA
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/app"
                  className="text-xs text-zinc-400 hover:text-white inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Ver como cliente
                </Link>
                <span className="text-xs text-zinc-500 hidden sm:inline">{user?.email}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-8 py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

interface SidebarProps {
  isActive: (to: string, exact: boolean) => boolean;
  onClick?: () => void;
  onSignOut: () => Promise<void> | void;
}

function SidebarContent({ isActive, onClick, onSignOut }: SidebarProps) {
  return (
    <>
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold">
            H
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 leading-none">
              Hub Nexus
            </p>
            <p className="text-sm font-semibold text-white mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClick}
              className={
                "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition " +
                (active
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100")
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-zinc-800">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </div>
    </>
  );
}
