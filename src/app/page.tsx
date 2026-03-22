import { adminDb, adminInitError } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const isEnvValid = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY;
  
  if (!isEnvValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212] font-sans">
        <div className="max-w-2xl bg-[#1e1e1e] border border-red-500/30 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <h1 className="text-3xl font-bold text-red-500">Missing Vercel Variables</h1>
          <p className="text-white/80 text-lg">Firebase Admin SDK cannot connect because credentials are missing on Vercel.</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-white space-y-2">
            <div>FIREBASE_PROJECT_ID: {process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</div>
            <div>FIREBASE_CLIENT_EMAIL: {process.env.FIREBASE_CLIENT_EMAIL ? '✅ Set' : '❌ Missing'}</div>
            <div>FIREBASE_PRIVATE_KEY: {process.env.FIREBASE_PRIVATE_KEY ? '✅ Set' : '❌ Missing'}</div>
          </div>
          <p className="text-white/60">Go to Vercel Settings &gt; Environment Variables, add them exactly, and redeploy.</p>
        </div>
      </div>
    );
  }

  if (adminInitError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212] font-sans">
        <div className="max-w-3xl bg-[#1e1e1e] border border-orange-500/30 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <h1 className="text-3xl font-bold text-orange-500">Firebase Credential Error</h1>
          <p className="text-white/80 text-lg">The environment variables exist, but the Firebase library rejected the Private Key formatting.</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-red-400 overflow-auto max-h-64 whitespace-pre-wrap">
            {adminInitError.message || adminInitError.toString()}
          </div>
          <p className="text-white/60">Try pasting just the `-----BEGIN PRIVATE KEY-----...` string, or the entire JSON payload. Our parser tries its best!</p>
        </div>
      </div>
    );
  }

  let username = null;
  let queryError = null;

  try {
    const snapshot = await adminDb.collection("profiles").limit(1).get();
    if (!snapshot.empty) {
      username = snapshot.docs[0].data().username;
    }
  } catch (error: any) {
    queryError = error;
  }

  if (queryError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212] font-sans">
        <div className="max-w-3xl bg-[#1e1e1e] border border-orange-500/30 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <h1 className="text-3xl font-bold text-orange-500">Firebase Config Error</h1>
          <p className="text-white/80 text-lg">The environment variables exist, but Firebase rejected the connection. Usually indicates a malformed Private Key.</p>
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-red-400 overflow-auto max-h-64 whitespace-pre-wrap">
            {queryError.message || queryError.toString()}
          </div>
          <p className="text-white/60">Check your FIREBASE_PRIVATE_KEY in Vercel. Ensure it matches exactly without weird quote formatting.</p>
        </div>
      </div>
    );
  }

  if (username) {
    redirect(`/${username}`);
  }

  redirect("/auth/login");
}
