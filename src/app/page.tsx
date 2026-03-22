import { adminDb, adminInitError } from "@/lib/firebase-admin";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function LandingPage() {
  const isEnvValid = process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY;
  
  const pk = process.env.FIREBASE_PRIVATE_KEY || '';
  const pkPrefix = pk.length > 15 ? pk.substring(0, 15) + '...' : pk;
  const pkLength = pk.length;

  if (!isEnvValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#121212] font-sans">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#121212] font-sans">
        <div className="max-w-3xl bg-[#1e1e1e] border border-orange-500/30 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <h1 className="text-3xl font-bold text-orange-500">Firebase Credential Error</h1>
          <p className="text-white/80 text-lg">The environment variables exist, but the Firebase library rejected the Private Key formatting.</p>
          
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-red-400 overflow-auto max-h-64 whitespace-pre-wrap">
            {adminInitError.message || adminInitError.toString()}
          </div>
          
          <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-xl font-mono text-sm text-blue-300 space-y-2">
            <h3 className="font-bold text-blue-400 mb-2">Diagnostic Data (What Vercel sees):</h3>
            <div>Length of FIREBASE_PRIVATE_KEY: <span className="text-white">{pkLength} characters</span></div>
            <div>Value starts with: <span className="text-white">"{pkPrefix}"</span></div>
            {pkLength < 100 && (
               <div className="text-orange-400 font-bold mt-2">
                 ⚠️ WARNING: Your private key is abnormally short! A real Firebase Private Key is usually &gt;1600 characters. You may have accidentally pasted your Project ID or Email into the Private Key field in Vercel.
               </div>
            )}
            {!pk.includes('BEGIN') && pkLength >= 100 && (
               <div className="text-orange-400 font-bold mt-2">
                 ⚠️ WARNING: Your private key does not contain "BEGIN PRIVATE KEY". You may have pasted the wrong value.
               </div>
            )}
          </div>
          
          <p className="text-white/60">Check your FIREBASE_PRIVATE_KEY in Vercel to ensure you pasted the actual Key.</p>
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
    const isNotFound = queryError.message?.includes("NOT_FOUND") || queryError.toString().includes("NOT_FOUND");
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#121212] font-sans text-white">
        <div className="max-w-3xl bg-[#1e1e1e] border border-orange-500/30 rounded-3xl p-8 space-y-6 shadow-2xl w-full">
          <h1 className="text-3xl font-bold text-orange-500">
            {isNotFound ? "Firestore Database Not Found" : "Firebase Config Error"}
          </h1>
          <p className="text-white/80 text-lg">
            {isNotFound 
              ? "Project ID Anda benar dan berhasil terhubung, namun Database Firestore belum diaktifkan atau tidak ditemukan di proyek ini."
              : "The environment variables exist, but Firebase rejected the connection."}
          </p>
          
          <div className="bg-black/50 p-4 rounded-xl font-mono text-sm text-red-400 overflow-auto max-h-64 whitespace-pre-wrap">
            {queryError.message || queryError.toString()}
          </div>

          {isNotFound && (
            <div className="bg-blue-900/20 border border-blue-500/30 p-5 rounded-2xl space-y-3">
              <h3 className="text-blue-400 font-bold flex items-center gap-2 text-lg">
                💡 Cara Memperbaiki Terakhir (Hanya 1 Klik):
              </h3>
              <ol className="text-white/80 space-y-2 list-decimal list-inside text-sm leading-relaxed">
                <li>Buka <a href={`https://console.firebase.google.com/project/${process.env.FIREBASE_PROJECT_ID}/firestore`} target="_blank" className="text-blue-400 underline italic">Firebase Console - Firestore</a></li>
                <li>Klik tombol <b>"Create Database"</b></li>
                <li>Pilih mode <b>"Production Mode"</b> dan pilih lokasi terdekat (misal: <i>asia-southeast2</i>).</li>
                <li>Setelah selesai, <b>Refresh</b> halaman ini!</li>
              </ol>
            </div>
          )}
          
          <p className="text-white/40 text-sm">Diagnostic Info: Firebase Admin Base64 Method is Active 🛡️</p>
        </div>
      </div>
    );
  }

  if (username) {
    redirect(`/${username}`);
  }

  // Fallback Landing Page if no profile exists yet
  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#121212] flex flex-col items-center justify-center p-6 text-center selection:bg-primary/20">
      <div className="max-w-2xl space-y-8">
        <div className="space-y-4">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl" />
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-7xl">
            CV-Mega <span className="text-primary italic">Platform</span>
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto">
            Platform pembuatan CV dinamis untuk profesional. Belum ada profil publik yang ditemukan untuk ditampilkan di sini.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <a
            href="/auth/login"
            className="px-10 py-4 bg-primary text-primary-foreground rounded-2xl font-bold hover:scale-105 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
          >
            Login ke Dashboard
          </a>
          <a
            href="/dashboard/users"
            className="px-10 py-4 bg-white dark:bg-[#1e1e1e] border-2 border-border rounded-2xl font-bold hover:bg-muted transition-all active:scale-95 shadow-sm"
          >
            Manage Profiles
          </a>
        </div>
        
        <div className="pt-16 grid grid-cols-2 sm:grid-cols-3 gap-8 opacity-40 grayscale">
          <div className="font-bold text-lg">FAST</div>
          <div className="font-bold text-lg">DYNAMIC</div>
          <div className="font-bold text-lg hidden sm:block">SECURE</div>
        </div>
      </div>
    </div>
  );
}
