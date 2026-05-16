"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Activity, FolderOpen, Smartphone, Sparkles } from "lucide-react";

const FEATURES = [
  {
    id: "realtime",
    icon: Activity,
    title: "Seguimiento en tiempo real",
    description:
      "Monitorea el avance de cada tarea al instante. Alertas inteligentes y dashboards vivos que tu equipo ve sincronizados.",
    color: "from-violet-500 to-indigo-500",
    bgLight: "bg-violet-50",
    textAccent: "text-violet-600",
    span: "md:col-span-2",
    tall: false,
  },
  {
    id: "docs",
    icon: FolderOpen,
    title: "Gestión de Documentos",
    description:
      "Versiona, busca y comparte archivos sin fricciones. Historial completo y permisos granulares.",
    color: "from-indigo-500 to-sky-500",
    bgLight: "bg-indigo-50",
    textAccent: "text-indigo-600",
    span: "md:col-span-1",
    tall: true,
  },
  {
    id: "multidevice",
    icon: Smartphone,
    title: "Multidevice",
    description:
      "Desde tu escritorio al móvil, la experiencia es impecable. Sincronización offline incluida.",
    color: "from-sky-500 to-teal-400",
    bgLight: "bg-sky-50",
    textAccent: "text-sky-600",
    span: "md:col-span-1",
    tall: false,
  },
  {
    id: "ai",
    icon: Sparkles,
    title: "Asistencia con IA",
    description:
      "Sugerencias automáticas, resúmenes de reuniones y detección de cuellos de botella impulsada por IA.",
    color: "from-teal-400 to-violet-500",
    bgLight: "bg-teal-50",
    textAccent: "text-teal-600",
    span: "md:col-span-2",
    tall: false,
  },
] as const;

const CARD_VARIANTS: Variants = {
  hidden: { y: 30, opacity: 0 },
  show: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.55,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

export default function BentoFeatures() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      aria-label="Características de Clarity Flow"
      className="py-24 sm:py-32 bg-slate-50/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <p className="text-sm font-semibold text-violet-600 uppercase tracking-widest mb-3">
            Características
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tighter text-slate-900 leading-tight">
            Todo lo que necesitas,
            <br className="hidden sm:block" /> nada que estorbe
          </h2>
          <p className="mt-4 text-lg text-slate-500 max-w-xl mx-auto">
            Un conjunto de herramientas cuidadosamente seleccionadas para que tu
            equipo fluya sin interrupciones.
          </p>
        </div>

        {/* Bento grid */}
        <div ref={ref} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURES.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.article
                key={feat.id}
                id={`feature-${feat.id}`}
                variants={CARD_VARIANTS}
                initial="hidden"
                animate={inView ? "show" : "hidden"}
                custom={i}
                className={`group relative rounded-2xl border border-slate-200 bg-white p-6 overflow-hidden cursor-default
                  hover:shadow-xl hover:shadow-slate-900/8 hover:-translate-y-1 transition-all duration-300
                  ${feat.span} ${feat.tall ? "md:row-span-2" : ""}`}
              >
                {/* Subtle gradient hover bg */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`mb-4 w-11 h-11 rounded-xl ${feat.bgLight} flex items-center justify-center`}
                >
                  <Icon className={`w-5 h-5 ${feat.textAccent}`} />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {feat.description}
                </p>

                {/* Visual accent line */}
                <div
                  className={`absolute bottom-0 left-0 h-0.5 w-0 bg-gradient-to-r ${feat.color} group-hover:w-full transition-all duration-500 ease-out`}
                />
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
