"use client";

import { useEffect, useState, use } from "react";
import { AnimatePresence } from "framer-motion";
import {
  doc, collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { Task, WorkOrder } from "@/lib/types";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TaskChat from "@/components/dashboard/TaskChat";
import DocumentPanel from "@/components/dashboard/DocumentPanel";
import TaskSidebar from "@/components/dashboard/TaskSidebar";

interface Props { params: Promise<{ otId: string }> }

export default function OTDetailPage({ params }: Props) {
  const { otId } = use(params);
  const { workspace, profile } = useWorkspace();
  const router = useRouter();
  const [ot, setOT] = useState<WorkOrder | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");

  // Listen to OT
  useEffect(() => {
    return onSnapshot(doc(db, "workorders", otId), (snap) => {
      if (!snap.exists()) { router.replace("/dashboard/ots"); return; }
      setOT({ id: snap.id, ...snap.data() } as WorkOrder);
    });
  }, [otId, router]);

  // Listen to tasks
  useEffect(() => {
    const q = query(collection(db, "workorders", otId, "tasks"), orderBy("createdAt", "asc"));
    return onSnapshot(q, (snap) => {
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Task));

      // Team only sees accepted tasks assigned to them
      const role = profile?.role;
      const uid = profile?.uid;
      const visible = role === "team"
        ? all.filter((t) => t.clientStatus === "aceptada" && t.assignedTo === uid)
        : all;

      setTasks(visible);
      if (visible.length > 0 && !selectedTask) setSelectedTask(visible[0]);
    });
  }, [otId, profile?.role, profile?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addTask(title: string, assignedTo?: string, assignedToName?: string) {
    await addDoc(collection(db, "workorders", otId, "tasks"), {
      title: title.trim(),
      otId,
      assignedTo: assignedTo ?? null,
      assignedToName: assignedToName ?? null,
      status: "pending",
      clientStatus: "propuesta",  // starts as "propuesta"
      createdAt: serverTimestamp(),
    });
  }

  async function cycleStatus(task: Task) {
    if (profile?.role === "client") return;
    const cycle: Record<string, string> = { pending: "in_progress", in_progress: "done", done: "pending" };
    await updateDoc(doc(db, "workorders", otId, "tasks", task.id), {
      status: cycle[task.status] ?? "pending",
    });
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <Link href="/dashboard/ots" className="mt-0.5 rounded-lg p-1 text-neutral-400 hover:text-white">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-white">{ot?.title ?? "…"}</h1>
          <p className="text-xs text-neutral-500">Cliente: {ot?.clientName} · #{otId.slice(0, 8)}</p>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden min-h-0">
        {/* Task sidebar */}
        <TaskSidebar
          tasks={tasks}
          otId={otId}
          workspaceId={workspace?.id ?? ""}
          profile={profile}
          selectedId={selectedTask?.id ?? null}
          onSelect={setSelectedTask}
          onAddTask={addTask}
          onCycleStatus={cycleStatus}
        />

        {/* Right panel */}
        {selectedTask ? (
          <div className="flex flex-1 flex-col rounded-2xl border border-white/8 bg-white/2 overflow-hidden">
            <div className="flex border-b border-white/8">
              {(["chat", "docs"] as const).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-sm font-medium transition-all ${
                    activeTab === tab ? "border-b-2 border-violet-500 text-white" : "text-neutral-500 hover:text-white"
                  }`}
                >
                  {tab === "chat" ? "💬 Chat" : "📁 Documentos"}
                </button>
              ))}
              <div className="ml-auto flex items-center px-4">
                <span className="text-xs text-neutral-500">{selectedTask.title}</span>
              </div>
            </div>
            <AnimatePresence mode="wait">
              {activeTab === "chat"
                ? <TaskChat key="chat" otId={otId} task={selectedTask} />
                : <DocumentPanel key="docs" otId={otId} task={selectedTask} />
              }
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-1 items-center justify-center rounded-2xl border border-white/8">
            <p className="text-sm text-neutral-500">
              {profile?.role === "team" ? "No tienes tareas asignadas aún." : "Selecciona o crea una tarea"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
