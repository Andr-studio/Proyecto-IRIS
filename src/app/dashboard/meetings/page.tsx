"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, query, where, onSnapshot,
  addDoc, serverTimestamp, orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { Meeting } from "@/lib/types";
import { meetingSchema } from "@/lib/types";
import { Video, Plus, ExternalLink, Calendar } from "lucide-react";
import { z } from "zod";

// ─── New Meeting Modal ────────────────────────────────────────────────────────

function NewMeetingModal({ workspaceId, onClose }: { workspaceId: string; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      meetingSchema.parse({ title, date, link, clientId });
      setSaving(true);
      await addDoc(collection(db, "meetings"), {
        title: title.trim(),
        date,
        link: link.trim(),
        clientId: clientId.trim(),
        workspaceId,
        otId: "",
        createdAt: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      setError(err instanceof z.ZodError ? err.issues[0].message : "Error al guardar");
    } finally { setSaving(false); }
  }

  const fields = [
    { label: "Título", value: title, setter: setTitle, placeholder: "Reunión de avance", type: "text" },
    { label: "Fecha y hora", value: date, setter: setDate, placeholder: "", type: "datetime-local" },
    { label: "Enlace (Google Meet / Zoom)", value: link, setter: setLink, placeholder: "https://meet.google.com/…", type: "url" },
    { label: "ID del Cliente", value: clientId, setter: setClientId, placeholder: "client_001", type: "text" },
  ] as const;

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
        <h2 className="mb-4 text-base font-semibold text-white">Nueva Reunión</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {fields.map(({ label, value, setter, placeholder, type }) => (
            <div key={label}>
              <label className="mb-1 block text-xs text-neutral-400">{label}</label>
              <input
                type={type} value={value}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                placeholder={placeholder} required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 [color-scheme:dark]"
              />
            </div>
          ))}
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
          <div className="mt-1 flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-neutral-400 hover:text-white">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
              {saving ? "Creando…" : "Crear"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MeetingsPage() {
  const { workspace, profile } = useWorkspace();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!workspace?.id || !profile) return;
    let q = query(
      collection(db, "meetings"),
      where("workspaceId", "==", workspace.id),
      orderBy("createdAt", "desc")
    );
    // Clients only see meetings assigned to them
    if (profile.role === "client" && profile.clientId) {
      q = query(
        collection(db, "meetings"),
        where("workspaceId", "==", workspace.id),
        where("clientId", "==", profile.clientId),
        orderBy("createdAt", "desc")
      );
    }
    return onSnapshot(q, (snap) => {
      setMeetings(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Meeting)));
    });
  }, [workspace?.id, profile]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video size={20} className="text-violet-400" />
          <h1 className="text-xl font-bold text-white">Reuniones</h1>
        </div>
        {profile?.role === "admin" && (
          <button
            id="new-meeting-btn"
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-all"
          >
            <Plus size={15} /> Nueva reunión
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {meetings.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.05 } }} exit={{ opacity: 0 }}
              className="flex flex-col rounded-2xl border border-white/8 bg-white/3 p-4 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600/20">
                  <Video size={15} className="text-violet-400" />
                </div>
                <a
                  href={m.link} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1 rounded-lg bg-violet-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-violet-500 transition-all"
                >
                  Unirse <ExternalLink size={10} />
                </a>
              </div>
              <p className="text-sm font-semibold text-white">{m.title}</p>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-neutral-500">
                <Calendar size={11} />
                {m.date ? new Date(m.date).toLocaleString("es-ES", { dateStyle: "medium", timeStyle: "short" }) : "Sin fecha"}
              </div>
              <p className="mt-2 text-[10px] text-neutral-600">Cliente: {m.clientId}</p>
            </motion.div>
          ))}
        </AnimatePresence>
        {meetings.length === 0 && (
          <p className="col-span-full py-12 text-center text-sm text-neutral-500">Sin reuniones programadas</p>
        )}
      </div>

      <AnimatePresence>
        {showNew && workspace?.id && (
          <NewMeetingModal workspaceId={workspace.id} onClose={() => setShowNew(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
