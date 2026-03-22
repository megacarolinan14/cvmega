"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { systemLog } from "@/lib/logger";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  pinVerified: boolean;
  setPinVerified: (verified: boolean) => void;
};

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true, 
  pinVerified: false, 
  setPinVerified: () => {} 
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pinVerified, setPinVerified] = useState(false);

  useEffect(() => {
    // Check session storage for existing verification
    const stored = sessionStorage.getItem("cv_mega_pin_verified");
    if (stored === "true") setPinVerified(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically sync profile to Firestore
        try {
          const userDocRef = doc(db, "profiles", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.slice(0, 8),
              displayName: firebaseUser.displayName || "",
              headline: "Professional Title",
              photoUrl: firebaseUser.photoURL || "",
              themePrimaryColor: "0 84.2% 60.2%", // Red default
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
            await systemLog("info", `New profile created for ${firebaseUser.email}`);
          } else {
            // Update lastLogin on every successful session start
            await setDoc(userDocRef, { 
              lastLogin: serverTimestamp(),
              displayName: docSnap.data().displayName || firebaseUser.displayName || "",
              photoUrl: docSnap.data().photoUrl || firebaseUser.photoURL || "" 
            }, { merge: true });
          }
        } catch (error: any) {
          console.error("Critical: Failed to sync user profile to Firestore:", error);
          systemLog("error", "Profile Sync Failed", { error: error.message });
          if (error.code === 'permission-denied') {
            toast.error("Firebase Permission Denied: Please update your Firestore Rules.");
          }
        }
      }
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSetPinVerified = (verified: boolean) => {
    setPinVerified(verified);
    if (verified) {
      sessionStorage.setItem("cv_mega_pin_verified", "true");
    } else {
      sessionStorage.removeItem("cv_mega_pin_verified");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, pinVerified, setPinVerified: handleSetPinVerified }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
