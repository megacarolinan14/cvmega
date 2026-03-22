import * as admin from 'firebase-admin';

export let adminInitError: Error | null = null;

try {
  if (!admin.apps.length) {
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cv-mega-5077a';
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || 
                         process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 
                         `${projectId}.firebasestorage.app`; // Primary modern naming

    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: projectId,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY_BASE64
          ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
          : process.env.FIREBASE_PRIVATE_KEY
            ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') 
            : undefined,
      }),
      storageBucket: storageBucket,
    });
    console.log("Firebase Admin initialized with bucket:", storageBucket);
  }
} catch (error: any) {
  console.error("Firebase Admin initialization failed:", error);
  adminInitError = error;
  if (!admin.apps.length) {
    // Return a dummy app as the DEFAULT app so the module doesn't crash during build
    admin.initializeApp({ projectId: "dummy-fallback" });
  }
}

export const adminDb = admin.firestore(); // jika pakai firestore
export const adminStorage = admin.storage();
export const adminAuth = admin.auth();
