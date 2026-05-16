import type { Role } from "@/lib/types";
import { createUserSchema } from "@/lib/types";
import { z } from "zod";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreateUserPayload {
  email: string;
  displayName: string;
  role: Exclude<Role, "owner">;
  workspaceId: string;
  createdBy: string;
  clientId?: string;
}

export interface CreateUserResult {
  uid: string;
  verificationLink: string;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calls the /api/users/create route which uses Firebase Admin SDK to:
 * 1. Create the Auth user
 * 2. Send a verification/set-password email
 * 3. Write the Firestore profile doc
 * 4. Write an audit log entry
 */
export async function createManagedUser(
  payload: CreateUserPayload
): Promise<CreateUserResult> {
  // Validate on client side before sending
  createUserSchema.parse(payload);

  const res = await fetch("/api/users/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error ?? "Error al crear usuario");
  }
  return json as CreateUserResult;
}

/**
 * Determines what roles a given actor role can create.
 */
export function getAllowedRolesToCreate(
  actorRole: Role
): Exclude<Role, "owner">[] {
  if (actorRole === "owner") return ["admin", "team", "client"];
  if (actorRole === "admin") return ["team", "client"];
  return [];
}

// ─── Zod re-export for schema validation in forms ─────────────────────────────
export { z };
