"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Cpu,
  LayoutDashboard,
  Users,
  Wallet,
  LogOut,
  Menu,
  X,
  BarChart3,
} from "lucide-react";
import { useState, useEffect } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "admin" | "user";
  username: string;
}

export default function Sidebar({ role, username }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hash, setHash] = useState("");

  useEffect(() => {
    setHash(window.location.hash);
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  function isActive(href: string) {
    if (href.includes("#")) {
      return `${pathname}${hash}` === href;
    }
    return pathname === href && !hash;
  }

  const adminNav: NavItem[] = [
    { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/admin/users", label: "Users", icon: <Users className="h-5 w-5" /> },
    { href: "/admin/withdrawals", label: "Withdrawals", icon: <Wallet className="h-5 w-5" /> },
  ];

  const userNav: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { href: "/dashboard#sms-history", label: "SMS History", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard#income-history", label: "Income History", icon: <BarChart3 className="h-5 w-5" /> },
    { href: "/dashboard#withdraw-history", label: "Withdraw History", icon: <Wallet className="h-5 w-5" /> },
    { href: "/dashboard#withdraw", label: "Withdraw", icon: <Wallet className="h-5 w-5" /> },
  ];

  const navItems = role === "admin" ? adminNav : userNav;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-purple-600">
          <Cpu className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-white">WS Task API</p>
          <p className="text-xs text-gray-500 capitalize">{role} Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "sidebar-link",
              isActive(item.href) && "sidebar-link-active"
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-glass-border p-4">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium text-white">{username}</p>
          <p className="text-xs text-gray-500 capitalize">{role}</p>
        </div>
        <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300">
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-50 rounded-xl border border-glass-border bg-glass-100 p-2 backdrop-blur-xl lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-glass-border bg-surface/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-4 top-4 lg:hidden"
        >
          <X className="h-5 w-5 text-gray-400" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
