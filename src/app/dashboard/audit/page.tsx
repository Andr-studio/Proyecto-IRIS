"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  collection, query, orderBy, onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { AuditLog } from "@/lib/types";
import { ShieldAlert, Clock } from "lucide-react";

// ─── Action labels ────────────────────────────────────────────────────────────
const ACTION_LABELS: Record<string, string> = {
  created_user:  "👤 Creó usuario",
  removed_user:  "🗑️ Eliminó usuario",
  approved_doc:  "✅ Aprobó documento",
  rejected_doc:  "❌ Rechazó documento",
  created_ot:    "📋 Creó OT",
  deleted_task:  "🗑️ Eliminó tarea",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const { workspace, isOwner } = useWorkspace();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workspace?.id || !isOwner) return;
    const q = query(
      collection(db, "workspaces", workspace.id, "auditLogs"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLog)));
      setLoading(false);
    });
  }, [workspace?.id, isOwner]);

  if (!isOwner) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-neutral-500">Sección exclusiva para el Owner del workspace.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <ShieldAlert size={20} className="text-violet-400" />
        <h1 className="text-xl font-bold text-white">Registro de Auditoría</h1>
        <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-neutral-400">
          {logs.length} entradas
        </span>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
        </div>
      )}

      <div className="space-y-2">
        {logs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0, transition: { delay: i * 0.025 } }}
            className="flex items-start gap-4 rounded-xl border border-white/8 bg-white/3 px-4 py-3"
          >
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-violet-600/20 text-sm">
              {ACTION_LABELS[log.action]?.split(" ")[0] ?? "🔹"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                <span className="font-medium text-violet-300">{log.actorEmail}</span>
                {" "}{ACTION_LABELS[log.action]?.slice(2) ?? log.action}
                {log.target && <span className="text-neutral-400"> → {log.target}</span>}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-600">
                <Clock size={10} />
                {log.createdAt
                  ? new Date((log.createdAt as { seconds: number }).seconds * 1000).toLocaleString("es-ES")
                  : "Ahora"}
              </p>
            </div>
          </motion.div>
        ))}
        {!loading && logs.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-500">No hay registros aún.</p>
        )}
      </div>
    </div>
  );
}
