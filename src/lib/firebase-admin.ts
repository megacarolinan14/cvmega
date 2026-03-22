import * as admin from "firebase-admin";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // The private key must replace actual literal \n characters with actual line breaks
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
};

export const createFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  return admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
    // storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET // Optional: if using Admin Storage
  });
};

export const adminApp = createFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminStorage = adminApp.storage();
