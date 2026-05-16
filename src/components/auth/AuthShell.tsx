"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { registerWithEmail, signInWithGoogle, signInWithEmail } from "@/lib/auth-service";
import { emailSignupSchema } from "@/lib/auth-service";
import { z } from "zod";

type Mode = "signin" | "signup";

// ─── Sub-components (kept lean to respect 150-line budget) ───────────────────

function InputField({
  id,
  label,
  type = "text",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-neutral-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        {...props}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none ring-0 transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/60"
      />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400"
    >
      {message}
    </motion.p>
  );
}

// ─── Main Shell ───────────────────────────────────────────────────────────────

export default function AuthShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync mode with query param
  useEffect(() => {
    const m = searchParams.get("mode");
    if (m === "signup" || m === "signin") {
      setMode(m as Mode);
    }
  }, [searchParams]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");

  function handleError(err: unknown) {
    if (err instanceof z.ZodError) {
      setError(err.issues[0].message);
    } else if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Ocurrió un error inesperado.");
    }
  }

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        if (mode === "signup") {
          await registerWithEmail(email, password, businessName);
        } else {
          await signInWithEmail(email, password);
        }
        router.push("/dashboard");
      } catch (err) {
        handleError(err);
      }
    });
  }

  function handleGoogle() {
    setError(null);
    startTransition(async () => {
      try {
        const { isNew } = await signInWithGoogle();
        router.push(isNew ? "/onboarding" : "/dashboard");
      } catch (err) {
        handleError(err);
      }
    });
  }

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -40, opacity: 0 },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-8 shadow-2xl backdrop-blur-xl">
        {/* Logo */}
        <p className="mb-8 text-center text-xl font-semibold tracking-tight text-white">
          Clarity<span className="text-violet-400">Flow</span>
        </p>

        {/* Mode Toggle */}
        <div className="mb-8 flex rounded-xl bg-white/5 p-1">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                mode === m
                  ? "bg-violet-600 text-white shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {m === "signin" ? "Iniciar sesión" : "Crear cuenta"}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
              <InputField id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@empresa.com" required />
              <InputField id="password" label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              {mode === "signup" && (
                <InputField id="businessName" label="Nombre de tu negocio" value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="Acme Corp" required />
              )}
              {error && <ErrorBanner message={error} />}
              <button
                type="submit"
                disabled={isPending}
                className="mt-2 w-full rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
              >
                {isPending ? "Cargando…" : mode === "signup" ? "Crear cuenta" : "Entrar"}
              </button>
            </form>
          </motion.div>
        </AnimatePresence>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-neutral-500">o continúa con</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={isPending}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/><path fill="none" d="M0 0h48v48H0z"/></svg>
          Google
        </button>
      </div>
    </div>
  );
}
