import type { Metadata } from "next";
import { WorkspaceProvider } from "@/lib/workspace-context";
import DashboardShell from "@/components/dashboard/DashboardShell";

export const metadata: Metadata = {
  title: "Dashboard — Clarity Flow",
  description: "Centro de operaciones de Clarity Flow",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <DashboardShell>{children}</DashboardShell>
    </WorkspaceProvider>
  );
}
