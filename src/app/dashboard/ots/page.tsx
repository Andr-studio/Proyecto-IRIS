"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { WorkOrder } from "@/lib/types";
import { workOrderSchema } from "@/lib/types";
import { Plus, Search, ChevronRight } from "lucide-react";
import Link from "next/link";
import { z } from "zod";

// ─── New OT Modal ─────────────────────────────────────────────────────────────

function NewOTModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientName, setClientName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      workOrderSchema.parse({ title, clientId, clientName });
      setSaving(true);
      await addDoc(collection(db, "workorders"), {
        title: title.trim(),
        clientId: clientId.trim(),
        clientName: clientName.trim(),
        status: "open",
        workspaceId,
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof z.ZodError ? err.issues[0].message : "Error al guardar");
    } finally { setSaving(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 16 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#13131f] p-6 shadow-2xl"
      >
        <h2 className="mb-4 text-base font-semibold text-white">Nueva Orden de Trabajo</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {[
            { label: "Título", value: title, setter: setTitle, placeholder: "Instalación eléctrica…" },
            { label: "ID Cliente", value: clientId, setter: setClientId, placeholder: "client_001" },
            { label: "Nombre Cliente", value: clientName, setter: setClientName, placeholder: "Acme Corp" },
          ].map(({ label, value, setter, placeholder }) => (
            <div key={label}>
              <label className="mb-1 block text-xs text-neutral-400">{label}</label>
              <input
                value={value} onChange={(e) => setter(e.target.value)} placeholder={placeholder} required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
              />
            </div>
          ))}
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-neutral-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
              {saving ? "Guardando…" : "Crear"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  open: "bg-sky-500/20 text-sky-300",
  in_progress: "bg-amber-500/20 text-amber-300",
  completed: "bg-emerald-500/20 text-emerald-300",
};

export default function OTsPage() {
  const { workspace, profile } = useWorkspace();
  const [ots, setOTs] = useState<WorkOrder[]>([]);
  const [search, setSearch] = useState("");
  const [newOT, setNewOT] = useState(false);

  useEffect(() => {
    if (!workspace?.id || !profile) return;
    const base = collection(db, "workorders");
    let q = query(base, where("workspaceId", "==", workspace.id), orderBy("createdAt", "desc"));
    if (profile.role === "client" && profile.clientId) {
      q = query(base, where("workspaceId", "==", workspace.id), where("clientId", "==", profile.clientId), orderBy("createdAt", "desc"));
    }
    return onSnapshot(q, (snap) => setOTs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkOrder))));
  }, [workspace?.id, profile]);

  const filtered = ots.filter(
    (o) =>
      o.clientName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">Órdenes de Trabajo</h1>
        {(profile?.role === "owner" || profile?.role === "admin") && (
          <button
            id="new-ot-btn"
            onClick={() => setNewOT(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-all"
          >
            <Plus size={15} /> Nueva OT
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
        <Search size={14} className="text-neutral-500" />
        <input
          id="ot-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por cliente o ID…"
          className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
        />
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {filtered.map((ot, i) => (
            <motion.div
              key={ot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0, transition: { delay: i * 0.04 } }}
              exit={{ opacity: 0 }}
            >
              <Link
                href={`/dashboard/ots/${ot.id}`}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3 transition-all hover:border-violet-500/30 hover:bg-white/6"
              >
                <div>
                  <p className="text-sm font-medium text-white">{ot.title}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{ot.clientName} · #{ot.id.slice(0, 8)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${STATUS_COLORS[ot.status]}`}>
                    {ot.status.replace("_", " ")}
                  </span>
                  <ChevronRight size={14} className="text-neutral-600" />
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-neutral-500">No se encontraron órdenes</p>
        )}
      </div>

      <AnimatePresence>
        {newOT && workspace?.id && (
          <NewOTModal workspaceId={workspace.id} onClose={() => setNewOT(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
