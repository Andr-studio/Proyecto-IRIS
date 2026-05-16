"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import { ClipboardList, CheckCircle, Clock, Users } from "lucide-react";

const card = {
  hidden: { opacity: 0, y: 20 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

interface Stat { label: string; value: number; Icon: React.ElementType; color: string }

export default function DashboardPage() {
  const { profile, workspace } = useWorkspace();
  const [stats, setStats] = useState<Stat[]>([]);

  useEffect(() => {
    if (!workspace?.id || !profile) return;

    async function load() {
      const base = collection(db, "workorders");
      let q = query(base, where("workspaceId", "==", workspace!.id));

      // Clients only see their own OTs
      if (profile!.role === "client" && profile!.clientId) {
        q = query(base, where("workspaceId", "==", workspace!.id), where("clientId", "==", profile!.clientId));
      }

      const snap = await getDocs(q);
      const ots = snap.docs.map((d) => d.data());
      const open = ots.filter((o) => o.status === "open").length;
      const inProgress = ots.filter((o) => o.status === "in_progress").length;
      const done = ots.filter((o) => o.status === "completed").length;

      const newStats: Stat[] = [
        { label: "Órdenes Activas", value: open + inProgress, Icon: ClipboardList, color: "from-violet-600/30 to-violet-600/10" },
        { label: "En Progreso", value: inProgress, Icon: Clock, color: "from-amber-500/30 to-amber-500/10" },
        { label: "Completadas", value: done, Icon: CheckCircle, color: "from-emerald-500/30 to-emerald-500/10" },
      ];

      if (profile!.role === "admin") {
        const teamSnap = await getDocs(query(collection(db, "users"), where("workspaceId", "==", workspace!.id), where("role", "==", "team")));
        newStats.push({ label: "Técnicos", value: teamSnap.size, Icon: Users, color: "from-sky-500/30 to-sky-500/10" });
      }

      setStats(newStats);
    }
    load();
  }, [workspace?.id, profile]);

  const greeting =
    profile?.role === "admin"
      ? "Panel de Control"
      : profile?.role === "team"
      ? "Panel Técnico"
      : "Mi Portal";

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white">{greeting}</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Bienvenido a <span className="text-violet-400">{workspace?.name ?? "tu espacio"}</span>
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            custom={i}
            variants={card}
            initial="hidden"
            animate="show"
            className={`rounded-2xl border border-white/8 bg-gradient-to-br ${s.color} p-5`}
          >
            <s.Icon size={20} className="mb-3 text-white/60" />
            <p className="text-3xl font-bold text-white">{s.value}</p>
            <p className="mt-1 text-xs text-neutral-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 rounded-2xl border border-white/8 bg-white/2 p-6"
      >
        <p className="text-sm text-neutral-400">
          Navega a <span className="text-violet-400">Órdenes de Trabajo</span> para gestionar proyectos y comunicarte con tu equipo.
        </p>
      </motion.div>
    </div>
  );
}
