"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { UserProfile, Workspace } from "@/lib/types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkspaceCtx {
  user: User | null;
  profile: UserProfile | null;
  workspace: Workspace | null;
  loading: boolean;
  isOwner: boolean;
  canManageBrand: boolean; // owner or admin
}

const WorkspaceContext = createContext<WorkspaceCtx>({
  user: null,
  profile: null,
  workspace: null,
  loading: true,
  isOwner: false,
  canManageBrand: false,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setWorkspace(null);
        setLoading(false);
      }
    });
    return unsubAuth;
  }, []);

  // Listen to profile doc when user is known
  useEffect(() => {
    if (!user) return;
    const ref = doc(db, "users", user.uid);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      const data = { uid: user.uid, ...snap.data() } as UserProfile;
      setProfile(data);
    });
  }, [user]);

  // Listen to workspace doc when profile is known
  useEffect(() => {
    if (!profile?.workspaceId) return;
    const ref = doc(db, "workspaces", profile.workspaceId);
    return onSnapshot(ref, (snap) => {
      if (!snap.exists()) return;
      setWorkspace({ id: snap.id, ...snap.data() } as Workspace);
      setLoading(false);
    });
  }, [profile?.workspaceId]);

  const isOwner = profile?.role === "owner";
  const canManageBrand = profile?.role === "owner" || profile?.role === "admin";

  return (
    <WorkspaceContext.Provider value={{ user, profile, workspace, loading, isOwner, canManageBrand }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWorkspace() {
  return useContext(WorkspaceContext);
}
