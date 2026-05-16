"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FADE_UP: Variants = {
  hidden: { y: 24, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function HeroSection() {
  return (
    <section
      id="hero"
      aria-label="Hero — Clarity Flow"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white"
    >
      {/* Ambient background orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-violet-100 via-indigo-50 to-transparent opacity-70 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-gradient-to-tl from-violet-200/40 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24 pb-16">
        {/* Eyebrow badge */}
        <motion.div variants={FADE_UP} initial="hidden" animate="show" custom={0}>
          <Badge
            id="hero-badge"
            className="mb-6 inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 border border-violet-200/60 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Nuevo — Análisis de flujo con IA
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tighter text-slate-900 leading-[1.05] mb-6"
        >
          Claridad total en
          <br />
          <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-violet-400 bg-clip-text text-transparent">
            cada proyecto
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          custom={2}
          className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-500 leading-relaxed mb-10"
        >
          Clarity Flow unifica el seguimiento en tiempo real, la gestión de documentos
          y la colaboración multidevice en una plataforma que tu equipo adorará usar.
        </motion.p>

        {/* CTA group */}
        <motion.div
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          custom={3}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link href="/auth?mode=signup">
            <Button
              id="hero-cta-primary"
              size="lg"
              className="group relative bg-slate-900 hover:bg-slate-700 text-white rounded-full px-8 h-12 text-base font-semibold shadow-xl shadow-slate-900/20 hover:shadow-slate-900/30 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Empieza gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>

          <Button
            id="hero-cta-secondary"
            variant="ghost"
            size="lg"
            className="group gap-2 text-slate-600 hover:text-slate-900 rounded-full px-6 h-12 text-base font-medium"
          >
            <span className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm group-hover:border-violet-300 group-hover:shadow-violet-100 transition-all">
              <Play className="w-3 h-3 fill-slate-700 text-slate-700" />
            </span>
            Ver demo
          </Button>
        </motion.div>

        {/* Social proof */}
        <motion.p
          variants={FADE_UP}
          initial="hidden"
          animate="show"
          custom={4}
          className="mt-8 text-sm text-slate-400"
        >
          Usado por{" "}
          <span className="font-semibold text-slate-600">+2,400 equipos</span>{" "}
          · Sin tarjeta de crédito · Cancela cuando quieras
        </motion.p>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 relative mx-auto max-w-4xl"
        >
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50 to-white shadow-2xl shadow-slate-900/10 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-slate-100 bg-slate-50/80">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 flex-1 h-6 rounded-full bg-white border border-slate-200 text-xs text-slate-400 flex items-center justify-center">
                app.clarityflow.io
              </span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 p-4 sm:p-6 min-h-[200px] sm:min-h-[260px]">
              <div className="col-span-1 space-y-2">
                {[70, 45, 85, 60].map((h, i) => (
                  <div key={i} className="rounded-xl bg-slate-100 border border-slate-200/60" style={{ height: `${h}px` }} />
                ))}
              </div>
              <div className="col-span-2 sm:col-span-3 space-y-3">
                <div className="h-10 rounded-xl bg-gradient-to-r from-violet-100 to-indigo-100 border border-violet-200/40" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 rounded-xl bg-slate-50 border border-slate-200/70" />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Glow under mockup */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-2/3 h-16 bg-violet-400/20 blur-2xl rounded-full" />
        </motion.div>
      </div>
    </section>
  );
}
