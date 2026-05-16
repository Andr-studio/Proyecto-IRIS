"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MessageSquare } from "lucide-react";
import type { Task, UserProfile } from "@/lib/types";
import { taskSchema } from "@/lib/types";
import TaskClientDecision, { CLIENT_STATUS_UI } from "@/components/dashboard/TaskClientDecision";
import { z } from "zod";

// ─── Work-status colors ───────────────────────────────────────────────────────

const WORK_STATUS = {
  pending:     "bg-neutral-700 text-neutral-300",
  in_progress: "bg-amber-500/20 text-amber-300",
  done:        "bg-emerald-500/20 text-emerald-300",
};
const WORK_LABEL = { pending: "Pendiente", in_progress: "En progreso", done: "Hecho" };

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  tasks: Task[];
  otId: string;
  workspaceId: string;
  profile: UserProfile | null;
  selectedId: string | null;
  onSelect: (task: Task) => void;
  onAddTask: (title: string, assignedTo?: string, assignedToName?: string) => Promise<void>;
  onCycleStatus: (task: Task) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TaskSidebar({
  tasks, otId, workspaceId, profile, selectedId, onSelect, onAddTask, onCycleStatus,
}: Props) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedToName, setAssignedToName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canCreate = profile?.role === "owner" || profile?.role === "admin";

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      taskSchema.parse({ title, assignedTo, assignedToName });
      await onAddTask(title, assignedTo || undefined, assignedToName || undefined);
      setTitle(""); setAssignedTo(""); setAssignedToName(""); setAdding(false);
    } catch (err) {
      setError(err instanceof z.ZodError ? err.issues[0].message : "Error");
    }
  }

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-neutral-500">Tareas</span>
        {canCreate && (
          <button id="add-task-btn" onClick={() => setAdding(true)}
            className="rounded-lg p-1 text-neutral-500 hover:text-violet-400">
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Add task inline form */}
      <AnimatePresence>
        {adding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} onSubmit={handleAdd}
            className="flex flex-col gap-1.5 overflow-hidden"
          >
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre de tarea…"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500" />
            <input value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} placeholder="UID técnico (opcional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500" />
            <input value={assignedToName} onChange={(e) => setAssignedToName(e.target.value)} placeholder="Nombre técnico (opcional)"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none focus:border-violet-500" />
            {error && <p className="text-[10px] text-red-400">{error}</p>}
            <div className="flex gap-1">
              <button type="submit" className="flex-1 rounded-lg bg-violet-600 py-1 text-xs font-semibold text-white">OK</button>
              <button type="button" onClick={() => setAdding(false)} className="flex-1 rounded-lg border border-white/10 py-1 text-xs text-neutral-400">✕</button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task list */}
      <div className="flex flex-col gap-1 overflow-y-auto">
        {tasks.map((t) => {
          const ui = CLIENT_STATUS_UI[t.clientStatus] ?? CLIENT_STATUS_UI.propuesta;
          const isSelected = t.id === selectedId;
          return (
            <button key={t.id} onClick={() => onSelect(t)}
              className={`group flex items-start gap-2 rounded-xl px-2.5 py-2 text-left transition-all ${
                isSelected ? "bg-violet-600/20 border border-violet-500/30" : "border border-transparent hover:bg-white/5"
              }`}
            >
              <MessageSquare size={13} className="mt-0.5 shrink-0 text-neutral-500" />
              <div className="min-w-0 space-y-1">
                <p className="truncate text-xs font-medium text-white">{t.title}</p>
                {/* Work status — clickable to cycle for non-clients */}
                <button onClick={(e) => { e.stopPropagation(); onCycleStatus(t); }}
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase ${WORK_STATUS[t.status]}`}>
                  {WORK_LABEL[t.status]}
                </button>
                {/* Client decision */}
                <TaskClientDecision task={t} otId={otId} workspaceId={workspaceId} />
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
