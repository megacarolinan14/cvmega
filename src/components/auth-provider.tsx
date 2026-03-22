"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Automatically sync profile to Firestore
        try {
          const userDocRef = doc(db, "profiles", firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          
          if (!docSnap.exists()) {
            await setDoc(userDocRef, {
              username: firebaseUser.email?.split('@')[0] || firebaseUser.uid.slice(0, 8),
              headline: "Professional Title",
              photoUrl: firebaseUser.photoURL || "",
              themePrimaryColor: "0 84.2% 60.2%", // Red default
              createdAt: serverTimestamp(),
              lastLogin: serverTimestamp(),
            });
          } else {
            // Update lastLogin on every successful session start
            await setDoc(userDocRef, { 
              lastLogin: serverTimestamp(),
              // Optionally sync photo if it changed
              photoUrl: firebaseUser.photoURL || docSnap.data().photoUrl || "" 
            }, { merge: true });
          }
        } catch (error) {
          console.error("Critical: Failed to sync user profile to Firestore:", error);
        }
      }
      
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
