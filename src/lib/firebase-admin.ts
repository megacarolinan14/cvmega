import * as admin from 'firebase-admin';

export let adminInitError: Error | null = null;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Ini bagian paling krusial sesuai saran:
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
          : undefined,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'cv-mega-5077a.firebasestorage.app',
    });
  }
} catch (error: any) {
  console.error("Firebase Admin initialization failed:", error);
  adminInitError = error;
  if (!admin.apps.length) {
    // Return a dummy app so the module doesn't crash during build
    admin.initializeApp({ projectId: "dummy-fallback" }, "dummy");
  }
}

export const adminDb = admin.firestore(); // jika pakai firestore
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();
