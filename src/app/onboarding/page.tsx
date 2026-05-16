"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth, } from "@/lib/firebase";
import { completeOnboarding } from "@/lib/auth-service";
import { businessNameSchema } from "@/lib/auth-service";
import { z } from "zod";

// ─── Animation Variants ───────────────────────────────────────────────────────

const slideIn = {
  initial: { x: 60, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.4, ease: "easeOut" as const } },
  exit: { x: -60, opacity: 0, transition: { duration: 0.25, ease: "easeIn" as const } },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [businessName, setBusinessName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.replace("/auth");
        return;
      }
      setUser(u);
      setReady(true);
    });
    return unsub;
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        businessNameSchema.parse({ businessName });
        await completeOnboarding(user!, businessName);
        router.push("/dashboard");
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError(err.issues[0].message);
        } else if (err instanceof Error) {
          setError(err.message);
        }
      }
    });
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key="onboarding"
          {...slideIn}
          className="w-full max-w-md overflow-hidden rounded-2xl border border-white/8 bg-white/3 p-10 shadow-2xl backdrop-blur-xl"
        >
          {/* Avatar */}
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt={user.displayName ?? "avatar"}
              className="mx-auto mb-6 h-16 w-16 rounded-full ring-2 ring-violet-500/50"
            />
          )}

          <h1 className="mb-2 text-center text-2xl font-semibold text-white">
            ¡Hola, {user?.displayName?.split(" ")[0] ?? "bienvenido"}!
          </h1>
          <p className="mb-8 text-center text-sm text-neutral-400">
            Solo un paso más:{" "}
            <span className="text-neutral-200">¿Cuál es el nombre de tu empresa?</span>
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="businessName" className="text-sm font-medium text-neutral-300">
                Nombre de empresa
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Acme Corp"
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-violet-500 focus:ring-1 focus:ring-violet-500/60"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isPending || businessName.trim().length < 3}
              className="mt-2 w-full rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:opacity-40"
            >
              {isPending ? "Creando tu espacio…" : "Comenzar →"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-600">
            ClarityFlow © {new Date().getFullYear()}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
