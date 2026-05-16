import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { z } from "zod";
import { auth, db } from "@/lib/firebase";

// ─── Schemas ────────────────────────────────────────────────────────────────

export const businessNameSchema = z.object({
  businessName: z
    .string()
    .min(3, "El nombre de empresa debe tener al menos 3 caracteres."),
});

export const emailSignupSchema = z.object({
  email: z.string().email("Email inválido."),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres."),
  businessName: z
    .string()
    .min(3, "El nombre de empresa debe tener al menos 3 caracteres."),
});

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  workspaceId: string;
  role: "admin" | "team" | "client";
  onboardingComplete: boolean;
  clientId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createWorkspaceAndUser(
  user: User,
  businessName: string
): Promise<void> {
  const workspaceId = user.uid;

  await setDoc(doc(db, "users", user.uid), {
    email: user.email ?? "",
    displayName: user.displayName ?? "",
    workspaceId,
    role: "owner",
    onboardingComplete: true,
    invitationStatus: "verified",
    createdAt: serverTimestamp(),
  });

  await setDoc(doc(db, "workspaces", workspaceId), {
    name: businessName,
    ownerUid: user.uid,
    createdAt: serverTimestamp(),
  });
}

/** Writes an entry to the workspace audit log. */
export async function writeAuditLog(
  workspaceId: string,
  actorUid: string,
  actorEmail: string,
  action: string,
  target?: string
): Promise<void> {
  await addDoc(collection(db, "workspaces", workspaceId, "auditLogs"), {
    actorUid,
    actorEmail,
    action,
    target: target ?? "",
    workspaceId,
    createdAt: serverTimestamp(),
  });
}

// ─── Public API ──────────────────────────────────────────────────────────────

/** Option A — Email/Password: creates Auth user + Workspace atomically. */
export async function registerWithEmail(
  email: string,
  password: string,
  businessName: string
): Promise<User> {
  const validated = emailSignupSchema.parse({ email, password, businessName });
  const { user } = await createUserWithEmailAndPassword(
    auth,
    validated.email,
    validated.password
  );
  await createWorkspaceAndUser(user, validated.businessName);
  return user;
}

/** Option B — Google: sign-in and returns whether the user needs onboarding. */
export async function signInWithGoogle(): Promise<{
  user: User;
  isNew: boolean;
}> {
  const provider = new GoogleAuthProvider();
  const { user } = await signInWithPopup(auth, provider);
  const snap = await getDoc(doc(db, "users", user.uid));
  const isNew = !snap.exists() || !snap.data()?.onboardingComplete;
  return { user, isNew };
}

/** Completes Google-user onboarding by creating their Workspace + User doc. */
export async function completeOnboarding(
  user: User,
  businessName: string
): Promise<void> {
  businessNameSchema.parse({ businessName });
  await createWorkspaceAndUser(user, businessName);
}

/** Fetches the current user's Firestore profile. */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() } as UserProfile;
}

/** Email/Password sign-in (existing accounts). */
export async function signInWithEmail(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
