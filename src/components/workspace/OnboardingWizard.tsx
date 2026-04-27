import { useState } from "react";
import { useWorkspace } from "@/hooks/useWorkspace";
import { SEGMENTS, COMPANY_SIZES, PAINS } from "@/lib/recommendations";
import { ChevronRight, Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Wizard de 3 perguntas exibido somente uma vez (quando profile.onboarded_at é null).
 * Salva segment, company_size, main_pain e marca onboarded_at.
 */
export function OnboardingWizard() {
  const { profileMeta, saveProfile, fullName } = useWorkspace();
  const needsOnboarding = !profileMeta.onboarded_at;
  const [step, setStep] = useState(0);
  const [segment, setSegment] = useState<string>(profileMeta.segment ?? "");
  const [size, setSize] = useState<string>(profileMeta.company_size ?? "");
  const [pain, setPain] = useState<string>(profileMeta.main_pain ?? "");
  const [saving, setSaving] = useState(false);

  if (!needsOnboarding) return null;

  const finish = async () => {
    setSaving(true);
    try {
      await saveProfile({
        segment,
        company_size: size,
        main_pain: pain,
        onboarded_at: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  };

  const total = 3;
  const canNext = (step === 0 && segment) || (step === 1 && size) || (step === 2 && pain);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="ws-card w-full max-w-lg p-7 sm:p-9"
      >
        {/* progresso */}
        <div className="flex items-center gap-1.5 mb-6">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors"
              style={{ backgroundColor: i <= step ? "rgb(var(--ws-primary))" : "rgb(var(--ws-border))" }}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 mb-2 ws-primary-text">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Passo {step + 1} de {total}
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
          >
            {step === 0 && (
              <Question
                title={`Bem-vindo${fullName ? `, ${fullName.split(" ")[0]}` : ""}!`}
                subtitle="Qual o segmento da sua operação?"
                options={SEGMENTS as readonly { id: string; label: string }[]}
                value={segment}
                onChange={setSegment}
              />
            )}
            {step === 1 && (
              <Question
                title="Bom saber."
                subtitle="Quantas pessoas trabalham com você?"
                options={COMPANY_SIZES as readonly { id: string; label: string }[]}
                value={size}
                onChange={setSize}
              />
            )}
            {step === 2 && (
              <Question
                title="Última coisa."
                subtitle="O que mais te incomoda hoje?"
                options={PAINS as readonly { id: string; label: string }[]}
                value={pain}
                onChange={setPain}
              />
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-7">
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="ws-btn-ghost text-sm disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={step === 0 || saving}
          >
            Voltar
          </button>
          {step < total - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="ws-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continuar <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={!canNext || saving}
              className="ws-btn-primary inline-flex items-center gap-1.5 disabled:opacity-40"
            >
              {saving ? "Salvando..." : (<>Concluir <Check className="h-4 w-4" /></>)}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Question({
  title, subtitle, options, value, onChange,
}: {
  title: string;
  subtitle: string;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold ws-text">{title}</h2>
      <p className="text-sm ws-text-muted mt-1">{subtitle}</p>

      <div className="mt-5 space-y-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              onClick={() => onChange(o.id)}
              className="w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center justify-between"
              style={{
                borderColor: active ? "rgb(var(--ws-primary))" : "rgb(var(--ws-border))",
                backgroundColor: active ? "rgb(var(--ws-primary) / 0.08)" : "rgb(var(--ws-surface))",
              }}
            >
              <span className="text-sm ws-text">{o.label}</span>
              {active && <Check className="h-4 w-4 ws-primary-text" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
