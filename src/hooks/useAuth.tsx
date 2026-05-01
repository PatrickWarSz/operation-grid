import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * MOCK AUTH — sem backend.
 * O usuário "loga" via formulário (qualquer email/senha) e é guardado em
 * localStorage para sobreviver a refresh. Backend real será plugado depois
 * fora deste template.
 */

export interface MockUser {
  id: string;
  email: string;
}

interface AuthContextValue {
  user: MockUser | null;
  loading: boolean;
  signIn: (email?: string) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "mock:user";

const DEFAULT_USER: MockUser = {
  id: "mock-user-1",
  email: "voce@empresa.com",
};

function readStored(): MockUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as MockUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(readStored());
    setLoading(false);
  }, []);

  const signIn = (email?: string) => {
    const u: MockUser = email ? { id: "mock-user-1", email } : DEFAULT_USER;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    }
    setUser(u);
  };

  const signOut = async () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve estar dentro de <AuthProvider>");
  return ctx;
}
