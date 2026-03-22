import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export type LogLevel = "info" | "warn" | "error";

export const systemLog = async (level: LogLevel, message: string, details?: any) => {
  try {
    // Only log if we are on the client-side to prevent Vercel build hangs
    if (typeof window === "undefined") return;

    await addDoc(collection(db, "system_logs"), {
      level,
      message,
      details: details ? JSON.stringify(details, Object.getOwnPropertyNames(details)) : null,
      timestamp: serverTimestamp(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
    
    // Also output to console for native debugging
    if (level === "error") console.error(`[SystemLog]`, message, details);
    if (level === "warn") console.warn(`[SystemLog]`, message, details);
    if (level === "info") console.log(`[SystemLog]`, message, details);
  } catch (err) {
    console.error("Failed to write to system logger:", err);
  }
};
