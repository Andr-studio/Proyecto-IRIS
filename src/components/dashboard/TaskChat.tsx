"use client";

import { useEffect, useRef, useState } from "react";
import {
  collection, query, orderBy, onSnapshot,
  addDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useWorkspace } from "@/lib/workspace-context";
import type { ChatMessage, Task } from "@/lib/types";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { createNotification } from "@/lib/notifications";

interface Props { otId: string; task: Task }

export default function TaskChat({ otId, task }: Props) {
  const { profile, workspace } = useWorkspace();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(
      collection(db, "workorders", otId, "tasks", task.id, "messages"),
      orderBy("createdAt", "asc")
    );
    return onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ChatMessage)));
    });
  }, [otId, task.id]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !profile || sending) return;
    setSending(true);
    try {
      await addDoc(
        collection(db, "workorders", otId, "tasks", task.id, "messages"),
        {
          text: text.trim(),
          senderUid: profile.uid,
          senderName: profile.displayName ?? profile.email,
          senderRole: profile.role,
          createdAt: serverTimestamp(),
        }
      );
      // Notify admin when non-admin sends a message
      if (profile.role !== "admin" && workspace?.id) {
        await createNotification(workspace.id, "new_message", `Nuevo mensaje en tarea "${task.title}"`);
      }
      setText("");
    } finally { setSending(false); }
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: "bg-violet-600/30 text-violet-200",
    team: "bg-sky-600/30 text-sky-200",
    client: "bg-emerald-600/30 text-emerald-200",
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-center text-xs text-neutral-600 mt-8">Sin mensajes aún. ¡Comienza la conversación!</p>
        )}
        {messages.map((m) => {
          const isMe = m.senderUid === profile?.uid;
          return (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-xs rounded-2xl px-3 py-2 ${isMe ? "rounded-br-sm bg-violet-600/40" : "rounded-bl-sm bg-white/8"}`}>
                {!isMe && (
                  <p className={`mb-0.5 text-[10px] font-semibold ${ROLE_COLORS[m.senderRole] ?? "text-neutral-400"} bg-transparent`}>
                    {m.senderName}
                  </p>
                )}
                <p className="text-sm text-white leading-relaxed">{m.text}</p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-white/8 p-3">
        <input
          id={`chat-input-${task.id}`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe un mensaje…"
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-violet-500 placeholder:text-neutral-600"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white hover:bg-violet-500 disabled:opacity-40 transition-all"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
