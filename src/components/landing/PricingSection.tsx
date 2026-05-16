"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/ mes",
    description: "Para equipos pequeños que quieren comenzar sin compromiso.",
    cta: "Comenzar gratis",
    ctaVariant: "outline" as const,
    popular: false,
    features: [
      "Hasta 5 miembros de equipo",
      "3 proyectos activos",
      "Almacenamiento de 5 GB",
      "Seguimiento básico en tiempo real",
      "Soporte por email",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$29",
    period: "/ mes por equipo",
    description: "Para equipos que exigen lo mejor: sin límites, sin fricción.",
    cta: "Empezar prueba de 14 días",
    ctaVariant: "default" as const,
    popular: true,
    features: [
      "Miembros ilimitados",
      "Proyectos ilimitados",
      "Almacenamiento de 1 TB",
      "Seguimiento avanzado + IA",
      "Gestión avanzada de documentos",
      "Sincronización multidevice offline",
      "Soporte prioritario 24/7",
      "Analytics e informes personalizados",
    ],
  },
];

const FADE_UP: Variants = {
  hidden: { y: 24, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function PricingSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="pricing"
      aria-label="Planes y precios"
      className="py-24 sm:py-32 bg-white"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">
            Precios
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-slate-900 leading-tight">
            Simple y transparente
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-md mx-auto">
            Sin costos ocultos. Escala cuando tu equipo lo necesite.
          </p>
        </div>

        {/* Cards */}
        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start"
        >
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              id={`pricing-${plan.id}`}
              variants={FADE_UP}
              initial="hidden"
              animate={inView ? "show" : "hidden"}
              custom={i}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.popular
                  ? "bg-slate-900 text-white shadow-2xl shadow-slate-900/30 scale-[1.02]"
                  : "bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <Badge
                  className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-500 to-indigo-500 text-white border-0 rounded-full px-4 py-1 text-xs font-semibold shadow-lg shadow-violet-500/30"
                >
                  <Zap className="w-3 h-3 mr-1 inline" />
                  Más popular
                </Badge>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <h3 className={`text-xl font-bold mb-1 ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm leading-relaxed ${plan.popular ? "text-slate-400" : "text-slate-500"}`}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mb-8 flex items-end gap-1">
                <span className={`text-5xl font-extrabold tracking-tighter ${plan.popular ? "text-white" : "text-slate-900"}`}>
                  {plan.price}
                </span>
                <span className={`text-sm mb-2 ${plan.popular ? "text-slate-400" : "text-slate-400"}`}>
                  {plan.period}
                </span>
              </div>

              {/* CTA */}
              <Link href="/auth?mode=signup" className="w-full">
                <Button
                  id={`pricing-cta-${plan.id}`}
                  variant={plan.popular ? "default" : "outline"}
                  className={`w-full rounded-full h-11 font-semibold text-sm transition-all duration-200 mb-8 ${
                    plan.popular
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-md"
                      : "border-slate-200 hover:border-violet-400 hover:text-violet-600"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>

              {/* Divider */}
              <div className={`border-t mb-6 ${plan.popular ? "border-white/10" : "border-slate-100"}`} />

              {/* Features list */}
              <ul className="space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                        plan.popular ? "bg-violet-500" : "bg-violet-100"
                      }`}
                    >
                      <Check className={`w-2.5 h-2.5 ${plan.popular ? "text-white" : "text-violet-600"}`} />
                    </span>
                    <span className={`text-sm ${plan.popular ? "text-slate-300" : "text-slate-600"}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-400 mt-8">
          ¿Necesitas un plan Enterprise personalizado?{" "}
          <a href="#" className="text-violet-600 hover:underline font-medium">
            Habla con ventas
          </a>
        </p>
      </div>
    </section>
  );
}
