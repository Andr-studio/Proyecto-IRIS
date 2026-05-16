import { z } from "zod";

// ─── Roles ────────────────────────────────────────────────────────────────────
export type Role = "owner" | "admin" | "team" | "client";

// ─── Workspace ────────────────────────────────────────────────────────────────
export interface Workspace {
  id: string;
  name: string;
  ownerUid: string;
  logoUrl?: string;
  createdAt: unknown;
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  workspaceId: string;
  role: Role;
  onboardingComplete: boolean;
  clientId?: string;           // only for role === 'client'
  invitationStatus: "pending" | "verified";
  createdBy?: string;          // uid of creator
}

// ─── Work Order (OT) ──────────────────────────────────────────────────────────
export interface WorkOrder {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: "open" | "in_progress" | "completed";
  createdAt: unknown;
  workspaceId: string;
}

export const workOrderSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  clientId: z.string().min(1, "Selecciona un cliente"),
  clientName: z.string().min(1),
});

// ─── Task ─────────────────────────────────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  otId: string;
  assignedTo?: string;          // uid of team member
  assignedToName?: string;
  status: "pending" | "in_progress" | "done";
  clientStatus: "propuesta" | "aceptada" | "rechazada"; // client decision
  createdAt: unknown;
}

export const taskSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres"),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
});

export const clientDecisionSchema = z.object({
  taskId: z.string().min(1),
  decision: z.enum(["aceptada", "rechazada"]),
});

// ─── Chat Message ─────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderRole: Role;
  createdAt: unknown;
}

// ─── Document ─────────────────────────────────────────────────────────────────
export interface OTDocument {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  requiresValidation: boolean;
  status: "pending" | "approved" | "rejected";
  otId: string;
  createdAt: unknown;
}

export const approvalSchema = z.object({
  docId: z.string().min(1),
  status: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotifType =
  | "doc_approved"
  | "evidence_uploaded"
  | "new_message"
  | "task_accepted"
  | "task_rejected"
  | "task_assigned";

export interface Notification {
  id: string;
  type: NotifType;
  message: string;
  read: boolean;
  workspaceId: string;
  recipientUid?: string; // null = all admins; set = specific user (team)
  createdAt: unknown;
}

// ─── Meeting ──────────────────────────────────────────────────────────────────
export interface Meeting {
  id: string;
  title: string;
  date: string;
  link: string;
  otId: string;
  clientId: string;
  createdAt: unknown;
}

export const meetingSchema = z.object({
  title: z.string().min(3),
  date: z.string().min(1, "Selecciona una fecha"),
  link: z.string().url("URL inválida"),
  clientId: z.string().min(1),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string;
  actorUid: string;
  actorEmail: string;
  action: string;       // e.g. "created_user", "deleted_task", "approved_doc"
  target?: string;      // e.g. target email / OT title
  workspaceId: string;
  createdAt: unknown;
}

// ─── Create-User Request (to API route) ───────────────────────────────────────
export const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  displayName: z.string().min(2, "Nombre mínimo 2 caracteres"),
  role: z.enum(["admin", "team", "client"]),
  workspaceId: z.string().min(1),
  createdBy: z.string().min(1),
  clientId: z.string().optional(),
});
