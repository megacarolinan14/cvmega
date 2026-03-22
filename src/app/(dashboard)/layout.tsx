"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  FileText, User, Briefcase, GraduationCap, Cpu, 
  Layers, Trophy, Languages, Settings, LogOut, 
  Terminal, Users
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle"; 
import { useAuth } from "@/components/auth-provider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

const sidebarLinks = [
  { href: "/dashboard", icon: FileText, title: "Overview" },
  { href: "/dashboard/profile", icon: User, title: "Profile" },
  { href: "/dashboard/experience", icon: Briefcase, title: "Experience" },
  { href: "/dashboard/education", icon: GraduationCap, title: "Education" },
  { href: "/dashboard/skills", icon: Cpu, title: "Skills" },
  { href: "/dashboard/projects", icon: Layers, title: "Projects" },
  { href: "/dashboard/certifications", icon: Trophy, title: "Certifications" },
  { href: "/dashboard/languages", icon: Languages, title: "Languages" },
  { href: "/dashboard/users", icon: Users, title: "Manage Users" },
  { href: "/dashboard/logs", icon: Terminal, title: "System Logs" },
  { href: "/dashboard/settings", icon: Settings, title: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/auth/login";
  };

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] dark:bg-[#121212] font-sans selection:bg-primary/20">
      
      {/* Floating Pill Sidebar */}
      <aside className="hidden md:flex flex-col w-20 bg-white dark:bg-[#1e1e1e] m-6 rounded-[2rem] shadow-[0_2px_20px_rgb(0,0,0,0.04)] dark:shadow-none items-center py-8 z-20 sticky top-6 h-[calc(100vh-3rem)]">
        
        {/* Logo */}
        <div className="w-10 h-10 bg-foreground/5 dark:bg-white/10 rounded-xl flex items-center justify-center mb-10">
          <Layers className="w-6 h-6 text-foreground" />
        </div>

        {/* Navigation Icons flex-1 with hidden scrollbar to prevent clipping if screen is small */}
        <nav className="flex-1 flex flex-col gap-4 w-full px-3 overflow-y-auto no-scrollbar">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link 
                key={link.href} 
                href={link.href}
                title={link.title}
                className={`w-14 h-14 shrink-0 mx-auto rounded-2xl flex items-center justify-center transition-all duration-200 ${
                  isActive 
                  ? "bg-primary/20 text-primary scale-105 shadow-sm" 
                  : "text-foreground/40 hover:bg-foreground/5 dark:hover:bg-white/5 hover:text-foreground"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto shrink-0 flex flex-col gap-4 w-full px-3 pt-6 border-t border-border/50">
          <button 
            title="Toggle Theme"
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-foreground/50 hover:bg-foreground/5 dark:hover:bg-white/5 hover:text-foreground transition-all"
          >
             <ThemeToggle />
          </button>
          <button 
            onClick={handleLogout}
            title="Log Out"
            className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center text-red-500/70 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 transition-all"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 md:pl-0 lg:p-10 lg:pl-4 overflow-y-auto w-full">
        <div className="max-w-[1200px] mx-auto min-h-full">
           {children}
        </div>
      </main>
      
      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 bg-white dark:bg-[#1e1e1e] border dark:border-border/50 rounded-2xl shadow-xl flex justify-start p-3 z-50 overflow-x-auto gap-2 no-scrollbar">
         {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} title={link.title} className={`p-3 shrink-0 rounded-xl transition-all ${isActive ? "bg-primary/20 text-primary" : "text-foreground/50 hover:bg-muted"}`}>
                <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
              </Link>
            );
         })}
      </div>
    </div>
  );
}
