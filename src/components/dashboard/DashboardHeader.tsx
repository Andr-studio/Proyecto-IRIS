"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Settings, Upload } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import type { Notification } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onMenuClick: () => void;
  menuIcon: ReactNode;
}

// ─── Notification Panel ───────────────────────────────────────────────────────

function NotificationPanel({
  workspaceId,
  onClose,
}: {
  workspaceId: string;
  onClose: () => void;
}) {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      where("workspaceId", "==", workspaceId),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setNotifs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Notification)));
    });
  }, [workspaceId]);

  async function markAllRead() {
    const batch = writeBatch(db);
    notifs.filter((n) => !n.read).forEach((n) => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  }

  const iconMap: Record<Notification["type"], string> = {
    doc_approved:      "✅",
    evidence_uploaded: "📸",
    new_message:       "💬",
    task_accepted:     "🎯",
    task_rejected:     "🚫",
    task_assigned:     "🔔",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.18 }}
      className="absolute right-0 top-full mt-2 w-80 rounded-2xl border border-white/10 bg-[#13131f] shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
        <span className="text-sm font-semibold text-white">Notificaciones</span>
        <button onClick={markAllRead} className="text-xs text-violet-400 hover:text-violet-300">
          Marcar todas como leídas
        </button>
      </div>
      <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
        {notifs.length === 0 && (
          <p className="py-6 text-center text-xs text-neutral-500">Sin notificaciones</p>
        )}
        {notifs.map((n) => (
          <div key={n.id} className={`flex gap-3 px-4 py-3 ${n.read ? "opacity-50" : ""}`}>
            <span className="text-lg">{iconMap[n.type]}</span>
            <p className="text-xs text-neutral-200 leading-relaxed">{n.message}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Brand Settings Modal ─────────────────────────────────────────────────────

function BrandModal({ onClose }: { onClose: () => void }) {
  const { workspace, profile } = useWorkspace();
  const [name, setName] = useState(workspace?.name ?? "");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleLogoUpload(file: File) {
    if (!workspace) return;
    setUploading(true);
    const storageRef = ref(storage, `workspaces/${workspace.id}/logo`);
    await uploadBytes(storageRef, file);
    const logoUrl = await getDownloadURL(storageRef);
    await updateDoc(doc(db, "workspaces", workspace.id), { logoUrl });
    setUploading(false);
  }

  async function handleSaveName() {
    if (!workspace || name.trim().length < 2) return;
    await updateDoc(doc(db, "workspaces", workspace.id), { name: name.trim() });
    onClose();
  }

  if (profile?.role !== "owner" && profile?.role !== "admin") return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#13131f] p-6 shadow-2xl"
      >
        <h2 className="mb-5 text-base font-semibold text-white">Configuración de marca</h2>
        <div className="mb-4">
          <label className="mb-1.5 block text-xs text-neutral-400">Nombre de empresa</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500"
          />
        </div>
        <div className="mb-5">
          <label className="mb-1.5 block text-xs text-neutral-400">Logo</label>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 hover:border-violet-500 transition-all"
          >
            <Upload size={14} />
            {uploading ? "Subiendo…" : "Subir logo"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
          />
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-neutral-400 hover:text-white transition-all">
            Cancelar
          </button>
          <button onClick={handleSaveName} className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-all">
            Guardar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export default function DashboardHeader({ onMenuClick, menuIcon }: Props) {
  const { workspace, profile, canManageBrand } = useWorkspace();
  const [notifOpen, setNotifOpen] = useState(false);
  const [brandOpen, setBrandOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!workspace?.id) return;
    const q = query(
      collection(db, "notifications"),
      where("workspaceId", "==", workspace.id),
      where("read", "==", false)
    );
    return onSnapshot(q, (snap) => setUnread(snap.size));
  }, [workspace?.id]);

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/8 bg-[#0a0a0f] px-4">
        {/* Left: menu + brand */}
        <div className="flex items-center gap-3">
          <button
            id="sidebar-menu-toggle"
            onClick={onMenuClick}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/5 hover:text-white transition-all md:hidden"
          >
            {menuIcon}
          </button>
          <div className="flex items-center gap-2.5">
            {workspace?.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={workspace.logoUrl} alt="logo" className="h-7 w-7 rounded-lg object-cover ring-1 ring-white/10" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
                {workspace?.name?.[0]?.toUpperCase() ?? "C"}
              </div>
            )}
            <span className="hidden text-sm font-semibold text-white sm:block">
              {workspace?.name ?? "Clarity Flow"}
            </span>
          </div>
        </div>

        {/* Right: bell + settings */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              id="notifications-bell"
              onClick={() => setNotifOpen((o) => !o)}
              className="relative rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-violet-500 ring-1 ring-[#0a0a0f]" />
              )}
            </button>
            <AnimatePresence>
              {notifOpen && workspace?.id && (
                <NotificationPanel workspaceId={workspace.id} onClose={() => setNotifOpen(false)} />
              )}
            </AnimatePresence>
          </div>

          {canManageBrand && (
            <button
              id="brand-settings-btn"
              onClick={() => setBrandOpen(true)}
              className="rounded-lg p-2 text-neutral-400 hover:bg-white/5 hover:text-white transition-all"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {brandOpen && <BrandModal onClose={() => setBrandOpen(false)} />}
      </AnimatePresence>
    </>
  );
}
