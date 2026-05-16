"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, UserPlus, CheckCircle } from "lucide-react";
import { useWorkspace } from "@/lib/workspace-context";
import { createManagedUser, getAllowedRolesToCreate } from "@/lib/user-service";
import type { Role } from "@/lib/types";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void;
  onSuccess: (email: string, role: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function InviteUserModal({ onClose, onSuccess }: Props) {
  const { workspace, profile } = useWorkspace();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Exclude<Role, "owner">>("team");
  const [clientId, setClientId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const allowedRoles = getAllowedRolesToCreate(profile?.role ?? "team");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!workspace?.id || !profile?.uid) return;
    setError(null);
    setSaving(true);
    try {
      await createManagedUser({
        email: email.trim(),
        displayName: displayName.trim(),
        role,
        workspaceId: workspace.id,
        createdBy: profile.uid,
        clientId: role === "client" ? clientId.trim() || email.trim() : undefined,
      });
      setDone(true);
      onSuccess(email, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario");
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
        {done ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle size={36} className="text-emerald-400" />
            <p className="text-sm font-semibold text-white">¡Usuario creado!</p>
            <p className="text-center text-xs text-neutral-400">
              Se envió un email de verificación a <span className="text-violet-300">{email}</span>.
              El usuario debe verificar su correo para acceder.
            </p>
            <button onClick={onClose} className="mt-2 w-full rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500">
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus size={16} className="text-violet-400" />
                <h2 className="text-base font-semibold text-white">Agregar miembro</h2>
              </div>
              <button onClick={onClose} className="rounded-lg p-1 text-neutral-500 hover:text-white"><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Nombre completo</label>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Juan García" required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Email corporativo</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="juan@empresa.com" required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-400">Rol</label>
                <select value={role} onChange={(e) => setRole(e.target.value as typeof role)}
                  className="w-full rounded-xl border border-white/10 bg-[#13131f] px-3 py-2 text-sm text-white outline-none focus:border-violet-500">
                  {allowedRoles.map((r) => (
                    <option key={r} value={r}>
                      {r === "admin" ? "Administrador" : r === "team" ? "Técnico (Team)" : "Cliente"}
                    </option>
                  ))}
                </select>
              </div>
              {role === "client" && (
                <div>
                  <label className="mb-1 block text-xs text-neutral-400">ID de Cliente (opcional)</label>
                  <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Autogenerado si vacío"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500" />
                </div>
              )}
              {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>}
              <p className="text-[10px] text-neutral-600">
                Se enviará un email de verificación automáticamente.
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-neutral-400 hover:text-white">Cancelar</button>
                <button type="submit" disabled={saving || allowedRoles.length === 0}
                  className="flex-1 rounded-xl bg-violet-600 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-50">
                  {saving ? "Creando…" : "Crear y enviar"}
                </button>
              </div>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
