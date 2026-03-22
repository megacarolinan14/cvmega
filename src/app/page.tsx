import { adminDb } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  // Fetch the first profile in the database
  const snapshot = await adminDb.collection("profiles").limit(1).get();
  
  if (!snapshot.empty) {
    const userDoc = snapshot.docs[0];
    const username = userDoc.data().username;
    
    // Redirect directly to the CV page
    if (username) {
      redirect(`/${username}`); // Wait, the URL is actually /[username], not /cv/[username] because the file is src/app/[username]/page.tsx
    }
  }

  // Fallback if no user exists yet
  redirect("/auth/login");
}
