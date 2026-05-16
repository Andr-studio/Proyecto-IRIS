"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/auth-service";

/**
 * SessionSync — invisible client component mounted in the root layout.
 * After Firebase resolves the auth state, it writes the minimal `__session`
 * cookie that the Edge Proxy reads for optimistic auth checks.
 */
export default function SessionSync() {
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await getUserProfile(user.uid);
        const payload = Buffer.from(
          JSON.stringify({
            uid: user.uid,
            onboardingComplete: profile?.onboardingComplete ?? false,
          })
        ).toString("base64");
        document.cookie = `__session=${payload}; path=/; SameSite=Strict`;
      } else {
        // Clear the session cookie on sign-out
        document.cookie = "__session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      }
    });
    return unsub;
  }, []);

  return null;
}
