import { adminDb } from "@/lib/firebase-admin";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  try {
    const snapshot = await adminDb.collection("profiles").limit(1).get();
    
    if (!snapshot.empty) {
      const userDoc = snapshot.docs[0];
      const username = userDoc.data().username;
      
      return <div>Debug Mode - Found user: {username || 'No username field'}</div>;
    }
    
    return <div>Debug Mode - No profiles found</div>;
  } catch (error: any) {
    return <div>Debug Mode - Error: {error.message} - {error.stack}</div>;
  }
}
