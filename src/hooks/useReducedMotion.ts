import { useEffect, useState } from "react";

/**
 * Detecta a preferência prefers-reduced-motion do sistema OU
 * um override manual salvo em localStorage ("ws-reduce-motion": "1" | "0").
 * Quando true, animações devem ser desativadas / simplificadas.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const override = window.localStorage.getItem("ws-reduce-motion");
    if (override === "1") return true;
    if (override === "0") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () => {
      const override = window.localStorage.getItem("ws-reduce-motion");
      if (override === "1") return setReduced(true);
      if (override === "0") return setReduced(false);
      setReduced(mq.matches);
    };
    compute();
    mq.addEventListener?.("change", compute);
    const onStorage = (e: StorageEvent) => {
      if (e.key === "ws-reduce-motion") compute();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mq.removeEventListener?.("change", compute);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  return reduced;
}

export function setReduceMotionOverride(value: boolean | null) {
  if (typeof window === "undefined") return;
  if (value === null) window.localStorage.removeItem("ws-reduce-motion");
  else window.localStorage.setItem("ws-reduce-motion", value ? "1" : "0");
  // dispara evento manual para hooks reagirem
  window.dispatchEvent(new StorageEvent("storage", { key: "ws-reduce-motion" }));
}
