"use client";

import { motion } from "framer-motion";
import { Trash2, ShieldCheck, Clock } from "lucide-react";
import type { UserProfile } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const ROLE_BADGE: Record<string, string> = {
  owner: "bg-amber-500/20 text-amber-300",
  admin: "bg-violet-500/20 text-violet-300",
  team: "bg-sky-500/20 text-sky-300",
  client: "bg-emerald-500/20 text-emerald-300",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  team: "Técnico",
  client: "Cliente",
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  member: UserProfile;
  currentUid: string;
  canRemove: boolean;
  index: number;
  onRemove: (uid: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemberRow({ member, currentUid, canRemove, index, onRemove }: Props) {
  const isVerified = member.invitationStatus === "verified";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.04 } }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-between rounded-xl border border-white/8 bg-white/3 px-4 py-3"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Avatar */}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-xs font-bold text-violet-300">
          {(member.displayName ?? member.email)[0].toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {member.displayName || member.email}
          </p>
          <p className="text-xs text-neutral-500 truncate">{member.email}</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${ROLE_BADGE[member.role]}`}>
              {ROLE_LABELS[member.role] ?? member.role}
            </span>
            <span className={`flex items-center gap-1 text-[10px] ${isVerified ? "text-emerald-400" : "text-amber-400"}`}>
              {isVerified ? <ShieldCheck size={10} /> : <Clock size={10} />}
              {isVerified ? "Verificado" : "Pendiente"}
            </span>
          </div>
        </div>
      </div>

      {canRemove && member.uid !== currentUid && member.role !== "owner" && (
        <button
          id={`remove-${member.uid}`}
          onClick={() => onRemove(member.uid)}
          className="ml-2 shrink-0 rounded-lg p-2 text-neutral-600 hover:bg-red-500/10 hover:text-red-400 transition-all"
          title="Eliminar miembro"
        >
          <Trash2 size={14} />
        </button>
      )}
    </motion.div>
  );
}
