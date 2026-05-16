"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, doc, updateDoc,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { OTDocument, Task } from "@/lib/types";
import { approvalSchema } from "@/lib/types";
import { Upload, CheckCircle, XCircle, FileText } from "lucide-react";
import { createNotification } from "@/lib/notifications";

interface Props { otId: string; task: Task }

export default function DocumentPanel({ otId, task }: Props) {
  const { profile, workspace } = useWorkspace();
  const [docs, setDocs] = useState<OTDocument[]>([]);
  const [uploading, setUploading] = useState(false);
  const [requiresValidation, setRequiresValidation] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "workorders", otId, "tasks", task.id, "documents"),
      orderBy("createdAt", "desc")
    );
    return onSnapshot(q, (snap) => {
      setDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() } as OTDocument)));
    });
  }, [otId, task.id]);

  async function handleUpload(file: File) {
    if (!profile || !workspace) return;
    setUploading(true);
    try {
      const path = `workspaces/${workspace.id}/ots/${otId}/tasks/${task.id}/${Date.now()}_${file.name}`;
      const sRef = storageRef(storage, path);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);

      await addDoc(collection(db, "workorders", otId, "tasks", task.id, "documents"), {
        name: file.name,
        url,
        uploadedBy: profile.uid,
        requiresValidation,
        status: "pending",
        otId,
        createdAt: serverTimestamp(),
      });

      // Notify admin when team uploads evidence
      if (profile.role === "team" && workspace.id) {
        await createNotification(workspace.id, "evidence_uploaded", `Nueva evidencia subida: "${file.name}" en tarea "${task.title}"`);
      }
    } finally { setUploading(false); }
  }

  async function handleApproval(docItem: OTDocument, status: "approved" | "rejected") {
    // Validate with Zod
    approvalSchema.parse({ docId: docItem.id, status });
    await updateDoc(
      doc(db, "workorders", otId, "tasks", task.id, "documents", docItem.id),
      { status }
    );
    if (status === "approved" && workspace?.id) {
      await createNotification(workspace.id, "doc_approved", `Cliente aprobó el documento "${docItem.name}"`);
    }
  }

  // Clients see only docs that are informational OR approved
  const visibleDocs =
    profile?.role === "client"
      ? docs.filter((d) => !d.requiresValidation || d.status !== "rejected")
      : docs;

  const canUpload = profile?.role === "admin" || profile?.role === "team";
  const isAdmin = profile?.role === "admin";

  const STATUS_UI: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    pending: { icon: FileText, color: "text-neutral-400", label: "Pendiente" },
    approved: { icon: CheckCircle, color: "text-emerald-400", label: "Aprobado" },
    rejected: { icon: XCircle, color: "text-red-400", label: "Rechazado" },
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden p-4 gap-4">
      {/* Upload row */}
      {canUpload && (
        <div className="flex items-center gap-3">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-neutral-300 hover:border-violet-500 transition-all disabled:opacity-50"
          >
            <Upload size={14} />
            {uploading ? "Subiendo…" : "Subir archivo"}
          </button>
          {isAdmin && (
            <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
              <input
                id="requires-validation-toggle"
                type="checkbox"
                checked={requiresValidation}
                onChange={(e) => setRequiresValidation(e.target.checked)}
                className="rounded accent-violet-500"
              />
              Requiere validación del cliente
            </label>
          )}
          <input
            ref={fileRef} type="file" className="hidden"
            onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          />
        </div>
      )}

      {/* Doc list */}
      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence>
          {visibleDocs.map((d) => {
            const ui = STATUS_UI[d.status] ?? STATUS_UI.pending;
            const showApproval = profile?.role === "client" && d.requiresValidation && d.status === "pending";
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start justify-between rounded-xl border border-white/8 bg-white/3 px-3 py-3"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <ui.icon size={16} className={`mt-0.5 shrink-0 ${ui.color}`} />
                  <div className="min-w-0">
                    <a href={d.url} target="_blank" rel="noreferrer"
                      className="block truncate text-sm font-medium text-violet-300 hover:text-violet-200 hover:underline">
                      {d.name}
                    </a>
                    <p className="text-[10px] text-neutral-500">
                      {d.requiresValidation ? "Requiere validación" : "Informativo"} · {ui.label}
                    </p>
                  </div>
                </div>

                {showApproval && (
                  <div className="flex gap-1.5 ml-2 shrink-0">
                    <button
                      id={`approve-${d.id}`}
                      onClick={() => handleApproval(d, "approved")}
                      className="rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
                    >
                      Aprobar
                    </button>
                    <button
                      id={`reject-${d.id}`}
                      onClick={() => handleApproval(d, "rejected")}
                      className="rounded-lg bg-red-500/20 px-2.5 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {visibleDocs.length === 0 && (
          <p className="py-8 text-center text-xs text-neutral-600">Sin documentos</p>
        )}
      </div>
    </div>
  );
}
