"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { FileText, Eye, Settings, Loader2 } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const docSnap = await getDoc(doc(db, "profiles", user.uid));
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile", error);
      } finally {
        setFetching(false);
      }
    };
    fetchProfile();
  }, [user]);

  if (loading || fetching) {
    return <div className="h-64 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  if (!user) return null;

  const isProfileComplete = !!profile?.username && !!profile?.headline;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.displayName?.split(' ')[0] || user.email?.split('@')[0]} 👋</h1>
        <p className="text-muted-foreground">Manage your majestic CV portfolio here.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Quick Stats / Actions */}
        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-4 p-6 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              CV Status
            </h3>
            <p className="text-sm text-muted-foreground">
              {isProfileComplete ? "Your profile is ready to be shared." : "Complete your profile to share your CV."}
            </p>
          </div>
          {isProfileComplete ? (
            <Link 
               href={`/cv/${profile.username}`}
               target="_blank"
               className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              <Eye className="mr-2 h-4 w-4" /> View Public CV
            </Link>
          ) : (
            <Link 
               href="/dashboard/profile"
               className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Complete Profile
            </Link>
          )}
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow space-y-4 p-6 flex flex-col justify-between">
           <div className="space-y-2">
             <h3 className="font-semibold leading-none tracking-tight flex items-center gap-2">
               <Settings className="h-5 w-5 text-purple-500" />
               Theme & Customization
             </h3>
             <p className="text-sm text-muted-foreground">
               Update your primary brand color to make your CV stand out.
             </p>
           </div>
           <Link 
               href="/dashboard/profile#theme"
               className="inline-flex h-9 w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Customize Design
            </Link>
        </div>
      </div>
    </div>
  );
}
