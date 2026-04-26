import { createFileRoute, Outlet, Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { WorkspaceProvider, useWorkspace } from "@/hooks/useWorkspace";
import { greetingFor, firstName } from "@/lib/workspace-theme";
import {
  Home,
  LayoutGrid,
  Store,
  Settings,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-zinc-500">
        <span className="text-sm">carregando workspace...</span>
      </div>
    );
  }
  if (!user) return null;

  return (
    <WorkspaceProvider>
      <WorkspaceShell />
    </WorkspaceProvider>
  );
}

const NAV = [
  { to: "/app", label: "Início", icon: Home, exact: true },
  { to: "/app/programas", label: "Programas", icon: LayoutGrid, exact: false },
  { to: "/app/catalogo", label: "Catálogo", icon: Store, exact: false },
  { to: "/app/configuracoes", label: "Configurações", icon: Settings, exact: false },
] as const;

function WorkspaceShell() {
  const { user, signOut } = useAuth();
  const { branding, tenantName, fullName, setMode } = useWorkspace();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const display = firstName(fullName ?? user?.email ?? "");
  const greeting = greetingFor();
  const workspaceLabel = branding.workspace_name || tenantName || "Workspace";

  const isActive = (to: string, exact: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="workspace-root" data-theme={branding.theme_mode}>
      <div className="flex min-h-screen">
        {/* Sidebar desktop */}
        <aside className="ws-sidebar hidden lg:flex w-60 flex-col p-4 sticky top-0 h-screen">
          <SidebarContent
            workspaceLabel={workspaceLabel}
            logo={branding.logo_url}
            isActive={isActive}
            onSignOut={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          />
        </aside>

        {/* Sidebar mobile (sheet) */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="ws-sidebar absolute left-0 top-0 bottom-0 w-64 p-4 flex flex-col">
              <button
                onClick={() => setMobileOpen(false)}
                className="self-end p-1 rounded hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent
                workspaceLabel={workspaceLabel}
                logo={branding.logo_url}
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
          <header
            className="sticky top-0 z-30 ws-surface border-b ws-border"
            style={{ borderBottomWidth: 1 }}
          >
            <div className="flex items-center justify-between px-4 sm:px-6 h-16">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  className="lg:hidden p-2 rounded ws-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs ws-text-muted leading-none">{greeting},</p>
                  <h1 className="text-base sm:text-lg font-semibold truncate ws-text mt-0.5">
                    {display || "Bem-vindo"}
                  </h1>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode(branding.theme_mode === "light" ? "dark" : "light")}
                  className="ws-btn-ghost p-2"
                  aria-label="Alternar tema"
                  title="Alternar tema"
                >
                  {branding.theme_mode === "light" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </button>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l ws-border" style={{ borderLeftWidth: 1 }}>
                  <div
                    className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-semibold ws-primary-bg"
                  >
                    {(display || user?.email || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs ws-text-muted hidden md:inline">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  workspaceLabel: string;
  logo: string | null;
  isActive: (to: string, exact: boolean) => boolean;
  onClick?: () => void;
  onSignOut: () => Promise<void> | void;
}

function SidebarContent({ workspaceLabel, logo, isActive, onClick, onSignOut }: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center gap-3 px-2 mt-2 mb-6">
        {logo ? (
          <img
            src={logo}
            alt={workspaceLabel}
            className="h-9 w-9 rounded-lg object-cover ws-surface-2"
          />
        ) : (
          <div className="h-9 w-9 rounded-lg ws-primary-bg flex items-center justify-center text-white text-sm font-bold">
            {workspaceLabel.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest ws-sidebar-muted leading-none">
            workspace
          </p>
          <p className="text-sm font-semibold truncate mt-0.5">{workspaceLabel}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to, item.exact);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onClick}
              className="ws-nav-link"
              data-active={active}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <button
        onClick={onSignOut}
        className="ws-nav-link mt-4 w-full text-left"
      >
        <LogOut className="h-4 w-4" />
        <span>Sair</span>
      </button>
    </>
  );
}
