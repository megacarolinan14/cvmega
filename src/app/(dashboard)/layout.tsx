"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, User, Briefcase, GraduationCap, Cpu, Layers, Trophy, Languages, Settings, LogOut, Terminal } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; // we will create this next
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: FileText },
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/experience", label: "Experience", icon: Briefcase },
  { href: "/dashboard/education", label: "Education", icon: GraduationCap },
  { href: "/dashboard/skills", label: "Skills", icon: Cpu },
  { href: "/dashboard/projects", label: "Projects", icon: Layers },
  { href: "/dashboard/certifications", label: "Certifications", icon: Trophy },
  { href: "/dashboard/languages", label: "Languages", icon: Languages },
  { href: "/dashboard/logs", label: "System Logs", icon: Terminal },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect shortly
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/40">
      {/* Sidebar (Desktop) */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
        <div className="flex h-14 items-center border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Layers className="h-6 w-6 text-primary" />
            <span className="text-lg text-primary tracking-tight">CV-Mega</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-auto py-4 px-3 space-y-1 block">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-muted-foreground transition-all hover:text-primary hover:bg-muted"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64 w-full">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 justify-between sm:justify-end">
          {/* Mobile menu goes here (trigger) */}
          <div className="sm:hidden font-semibold text-primary">CV-Mega</div>
          <div className="flex items-center gap-4">
             <ThemeToggle />
             <div className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-red-500 transition-colors" onClick={() => signOut(auth)}>
               <LogOut className="h-4 w-4" />
               <span className="text-sm font-medium hidden sm:inline">Logout</span>
             </div>
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
}
