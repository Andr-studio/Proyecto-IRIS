import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { NotifType } from "@/lib/types";

/**
 * Creates a notification.
 * Pass recipientUid to target a specific user (e.g., team member).
 * Leave undefined to notify all admins in the workspace.
 */
export async function createNotification(
  workspaceId: string,
  type: NotifType,
  message: string,
  recipientUid?: string
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    workspaceId,
    type,
    message,
    read: false,
    recipientUid: recipientUid ?? null,
    createdAt: serverTimestamp(),
  });
}
