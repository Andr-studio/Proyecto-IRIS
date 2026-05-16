"use client";

import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import { createNotification } from "@/lib/notifications";
import { clientDecisionSchema } from "@/lib/types";
import type { Task } from "@/lib/types";

// ─── Status config ────────────────────────────────────────────────────────────

export const CLIENT_STATUS_UI = {
  propuesta: { label: "Propuesta", color: "bg-neutral-700/50 text-neutral-300", Icon: Clock },
  aceptada:  { label: "Aceptada",  color: "bg-emerald-500/20 text-emerald-300", Icon: CheckCircle2 },
  rechazada: { label: "Rechazada", color: "bg-red-500/20 text-red-400",         Icon: XCircle },
} as const;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  task: Task;
  otId: string;
  workspaceId: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskClientDecision({ task, otId, workspaceId }: Props) {
  const { profile } = useWorkspace();
  const ui = CLIENT_STATUS_UI[task.clientStatus] ?? CLIENT_STATUS_UI.propuesta;

  async function decide(decision: "aceptada" | "rechazada") {
    clientDecisionSchema.parse({ taskId: task.id, decision });
    await updateDoc(doc(db, "workorders", otId, "tasks", task.id), {
      clientStatus: decision,
    });

    // Notify admins
    const msg = decision === "aceptada"
      ? `Cliente aceptó la tarea "${task.title}"`
      : `Cliente rechazó la tarea "${task.title}"`;
    const type = decision === "aceptada" ? "task_accepted" : "task_rejected";
    await createNotification(workspaceId, type, msg);

    // If accepted and assigned, notify the technician
    if (decision === "aceptada" && task.assignedTo) {
      await createNotification(
        workspaceId,
        "task_assigned",
        `Nueva tarea asignada: "${task.title}"`,
        task.assignedTo
      );
    }
  }

  const isClient = profile?.role === "client";
  const isPropuesta = task.clientStatus === "propuesta";

  return (
    <div className="flex items-center gap-2">
      {/* Status badge */}
      <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${ui.color}`}>
        <ui.Icon size={10} />
        {ui.label}
      </span>

      {/* Client action buttons — only shown if pending and user is client */}
      {isClient && isPropuesta && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex gap-1"
        >
          <button
            id={`accept-task-${task.id}`}
            onClick={() => decide("aceptada")}
            className="rounded-lg bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-all"
          >
            Aceptar
          </button>
          <button
            id={`reject-task-${task.id}`}
            onClick={() => decide("rechazada")}
            className="rounded-lg bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-300 hover:bg-red-500/30 transition-all"
          >
            Rechazar
          </button>
        </motion.div>
      )}
    </div>
  );
}
