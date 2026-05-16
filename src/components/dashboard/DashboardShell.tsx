"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Video,
  LogOut,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "@/lib/auth-service";
import { useWorkspace } from "@/lib/workspace-context";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const NAV = [
  { href: "/dashboard",          label: "Overview",          Icon: LayoutDashboard, roles: ["owner", "admin", "team", "client"] },
  { href: "/dashboard/ots",      label: "Órdenes de Trabajo", Icon: ClipboardList,    roles: ["owner", "admin", "team", "client"] },
  { href: "/dashboard/team",     label: "Equipo",             Icon: Users,            roles: ["owner", "admin"] },
  { href: "/dashboard/meetings", label: "Reuniones",          Icon: Video,            roles: ["owner", "admin", "client"] },
  { href: "/dashboard/audit",    label: "Auditoría",          Icon: ShieldAlert,      roles: ["owner"] },
] as const;

export default function DashboardShell({ children }: { children: ReactNode }) {
  const { profile, loading } = useWorkspace();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleSignOut() {
    await signOut();
    router.push("/auth");
  }

  const filteredNav = NAV.filter((n) =>
    profile ? n.roles.includes(profile.role as never) : false
  );

  const Sidebar = (
    <aside className="flex h-full w-64 flex-col bg-[#0f0f1a] border-r border-white/8">
      <div className="px-5 py-6">
        <p className="text-lg font-semibold text-white">
          Clarity<span className="text-violet-400">Flow</span>
        </p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {filteredNav.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-neutral-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={17} className={active ? "text-violet-400" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/8">
        {!loading && profile && (
          <div className="mb-3 px-2">
            <p className="text-xs font-medium text-white truncate">{profile.displayName || profile.email}</p>
            <p className="text-[10px] text-neutral-500 truncate">{profile.email}</p>
            <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
              profile.role === "owner" ? "bg-amber-500/20 text-amber-300"
              : profile.role === "admin" ? "bg-violet-500/20 text-violet-300"
              : profile.role === "team" ? "bg-sky-500/20 text-sky-300"
              : "bg-emerald-500/20 text-emerald-300"
            }`}>
              {profile.role === "owner" ? "👑 Owner" : profile.role}
            </span>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 flex-shrink-0">{Sidebar}</div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed inset-y-0 left-0 z-50 w-64 md:hidden"
            >
              {Sidebar}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <DashboardHeader onMenuClick={() => setSidebarOpen((o) => !o)} menuIcon={sidebarOpen ? <X size={20} /> : <Menu size={20} />} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
