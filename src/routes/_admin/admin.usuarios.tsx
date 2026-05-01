import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/usuarios")({
  head: () => ({ meta: [{ title: "Admin — Usuários" }] }),
  component: UsuariosPage,
});

interface ProfileRow {
  id: string;
  full_name: string | null;
  tenant_id: string | null;
  is_admin: boolean;
}

const MOCK_USERS: ProfileRow[] = [
  { id: "user-1", full_name: "João Silva", tenant_id: "tenant-1", is_admin: true },
  { id: "user-2", full_name: "Maria Souza", tenant_id: "tenant-1", is_admin: false },
  { id: "user-3", full_name: "Carlos Lima", tenant_id: "tenant-2", is_admin: false },
  { id: "user-4", full_name: "Ana Pereira", tenant_id: "tenant-3", is_admin: true },
  { id: "user-5", full_name: "Pedro Almeida", tenant_id: "tenant-3", is_admin: false },
];

function UsuariosPage() {
  const [rows, setRows] = useState<ProfileRow[]>(MOCK_USERS);
  const [search, setSearch] = useState("");

  const toggleAdmin = (userId: string, makeAdmin: boolean) => {
    setRows((r) => r.map((u) => (u.id === userId ? { ...u, is_admin: makeAdmin } : u)));
  };

  const filtered = rows.filter(
    (r) => !search || (r.full_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Usuários</h1>
        <p className="text-sm text-zinc-400 mt-1">Promova ou revogue Super Admins.</p>
      </header>

      <input
        placeholder="Buscar por nome..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm focus:outline-none focus:border-zinc-700"
      />

      <div className="rounded-xl border border-zinc-800 bg-zinc-900 divide-y divide-zinc-800">
        {filtered.length === 0 ? (
          <p className="p-5 text-sm text-zinc-500">Nenhum usuário encontrado.</p>
        ) : (
          filtered.map((u) => (
            <div key={u.id} className="p-4 flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{u.full_name ?? <span className="text-zinc-500">(sem nome)</span>}</p>
                <p className="text-xs text-zinc-500 mt-0.5 font-mono truncate">{u.id}</p>
              </div>
              <button
                onClick={() => toggleAdmin(u.id, !u.is_admin)}
                className={
                  "ml-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition " +
                  (u.is_admin
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700")
                }
              >
                {u.is_admin ? <><Shield className="h-3.5 w-3.5" /> Super Admin</> : <><ShieldOff className="h-3.5 w-3.5" /> Promover</>}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
