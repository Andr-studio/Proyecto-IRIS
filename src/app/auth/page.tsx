import { Suspense } from "react";
import AuthShell from "@/components/auth/AuthShell";

export const metadata = {
  title: "Acceso — Clarity Flow",
  description: "Inicia sesión o crea tu cuenta en Clarity Flow.",
};

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <AuthShell />
    </Suspense>
  );
}
