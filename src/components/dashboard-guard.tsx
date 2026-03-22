"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const REQUIRED_PIN = "101010";

export function DashboardGuard({ children }: { children: React.ReactNode }) {
  const { user, loading, pinVerified, setPinVerified } = useAuth();
  const [pin, setPin] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(false);

  // Auto-focus the PIN input
  useEffect(() => {
    if (user && !pinVerified) {
       const timer = setTimeout(() => {
         document.getElementById("pin-input")?.focus();
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [user, pinVerified]);

  const handleVerify = (e?: React.FormEvent) => {
    e?.preventDefault();
    setChecking(true);
    
    // Artificial small delay for premium feel
    setTimeout(() => {
        if (pin === REQUIRED_PIN) {
          setPinVerified(true);
          toast.success("Identity verified. Welcome back!");
        } else {
          setError(true);
          setPin("");
          toast.error("Incorrect PIN. Access Denied.");
          setTimeout(() => setError(false), 500);
        }
        setChecking(false);
    }, 600);
  };

  // If still loading auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // If not logged in at all, we let the layout/page handle redirect to /auth/login
  if (!user) {
    return <>{children}</>;
  }

  // If logged in but PIN not verified
  if (!pinVerified) {
    return (
      <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4">
        <div className={`max-w-md w-full bg-card border rounded-[2.5rem] p-8 shadow-2xl transition-all duration-300 ${error ? "animate-shake border-red-500 shadow-red-500/10" : "border-primary/20 shadow-primary/5"}`}>
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Security Check</h2>
              <p className="text-muted-foreground text-sm">
                Enter your 6-digit dashboard PIN to continue.
              </p>
            </div>

            <form onSubmit={handleVerify} className="w-full space-y-4">
              <div className="relative">
                <Input
                  id="pin-input"
                  type="password"
                  maxLength={6}
                  placeholder="&bull; &bull; &bull; &bull; &bull; &bull;"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ""))}
                  className="text-center text-2xl tracking-[1em] h-16 rounded-2xl border-2 focus-visible:ring-primary/30"
                  autoComplete="off"
                />
              </div>

              <Button 
                type="submit" 
                disabled={pin.length < 6 || checking} 
                className="w-full h-14 rounded-2xl text-lg font-bold transition-all active:scale-95"
              >
                {checking ? <Loader2 className="h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                Unlock Dashboard
              </Button>
            </form>
            
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Protected by CV-Mega Security 层
            </p>
          </div>
        </div>
      </div>
    );
  }

  // If all good
  return <>{children}</>;
}
