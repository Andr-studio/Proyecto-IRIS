"use client";

import { useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import {
  collection, query, where, onSnapshot,
  doc, deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { UserProfile } from "@/lib/types";
import { Users, UserPlus } from "lucide-react";
import MemberRow from "@/components/team/MemberRow";
import InviteUserModal from "@/components/team/InviteUserModal";
import { writeAuditLog } from "@/lib/auth-service";

export default function TeamPage() {
  const { workspace, profile, isOwner } = useWorkspace();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [recentInvite, setRecentInvite] = useState<string | null>(null);

  const canManageTeam = profile?.role === "owner" || profile?.role === "admin";

  useEffect(() => {
    if (!workspace?.id) return;
    const q = query(collection(db, "users"), where("workspaceId", "==", workspace.id));
    return onSnapshot(q, (snap) => {
      setMembers(snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile)));
    });
  }, [workspace?.id]);

  async function removeMember(uid: string) {
    if (!workspace?.id || !profile) return;
    const target = members.find((m) => m.uid === uid);
    await deleteDoc(doc(db, "users", uid));
    await writeAuditLog(
      workspace.id, profile.uid, profile.email,
      "removed_user", target?.email
    );
  }

  if (!canManageTeam) {
    return <p className="text-sm text-neutral-500">Sin acceso a esta sección.</p>;
  }

  const pending = members.filter((m) => m.invitationStatus === "pending");
  const verified = members.filter((m) => m.invitationStatus !== "pending");

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-violet-400" />
          <h1 className="text-xl font-bold text-white">Equipo</h1>
          <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs text-neutral-400">
            {members.length} miembro{members.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          id="invite-member-btn"
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 transition-all"
        >
          <UserPlus size={15} /> Agregar miembro
        </button>
      </div>

      {/* Recent invite banner */}
      <AnimatePresence>
        {recentInvite && (
          <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
            ✅ Email de verificación enviado a <strong>{recentInvite}</strong>
          </div>
        )}
      </AnimatePresence>

      {/* Pending invitations */}
      {pending.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-400/70">
            Verificación pendiente ({pending.length})
          </p>
          <div className="space-y-2">
            <AnimatePresence>
              {pending.map((m, i) => (
                <MemberRow
                  key={m.uid}
                  member={m}
                  currentUid={profile!.uid}
                  canRemove={canManageTeam}
                  index={i}
                  onRemove={removeMember}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Verified members */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-500">
          Activos ({verified.length})
        </p>
        <div className="space-y-2">
          <AnimatePresence>
            {verified.map((m, i) => (
              <MemberRow
                key={m.uid}
                member={m}
                currentUid={profile!.uid}
                canRemove={isOwner || (profile?.role === "admin" && m.role !== "admin")}
                index={i}
                onRemove={removeMember}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteUserModal
            onClose={() => setShowInvite(false)}
            onSuccess={(email) => {
              setShowInvite(false);
              setRecentInvite(email);
              setTimeout(() => setRecentInvite(null), 5000);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
