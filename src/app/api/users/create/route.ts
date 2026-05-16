import { NextResponse, type NextRequest } from "next/server";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { createUserSchema } from "@/lib/types";
import { z } from "zod";

// ─── Admin SDK Init (singleton) ───────────────────────────────────────────────

function getAdminApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// ─── POST /api/users/create ───────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createUserSchema.parse(body);

    const app = getAdminApp();
    const adminAuth = getAuth(app);
    const adminDb = getFirestore(app);

    // 1. Create Firebase Auth user with a temp password
    const tempPassword = `Clarity${Math.random().toString(36).slice(-8)}!`;
    const userRecord = await adminAuth.createUser({
      email: data.email,
      displayName: data.displayName,
      password: tempPassword,
      emailVerified: false,
    });

    // 2. Generate email verification link (user sets their password via this)
    const verificationLink = await adminAuth.generateEmailVerificationLink(data.email);

    // 3. Write Firestore user document
    await adminDb.collection("users").doc(userRecord.uid).set({
      email: data.email,
      displayName: data.displayName,
      workspaceId: data.workspaceId,
      role: data.role,
      onboardingComplete: true,
      invitationStatus: "pending",
      clientId: data.clientId ?? null,
      createdBy: data.createdBy,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Write audit log
    await adminDb
      .collection("workspaces")
      .doc(data.workspaceId)
      .collection("auditLogs")
      .add({
        actorUid: data.createdBy,
        actorEmail: "system",
        action: "created_user",
        target: `${data.email} (${data.role})`,
        workspaceId: data.workspaceId,
        createdAt: FieldValue.serverTimestamp(),
      });

    return NextResponse.json({ uid: userRecord.uid, verificationLink }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0].message }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
