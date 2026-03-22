import * as admin from "firebase-admin";

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  // Handle both escaped newlines from env vars and actual newlines
  return key.replace(/\\n/g, "\n").replace(/"/g, ''); 
};

export const createFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(`Firebase Admin SDK configuration is incomplete. Project ID: ${!!projectId}, Client Email: ${!!clientEmail}, Private Key: ${!!privateKey}`);
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
};

export const adminApp = createFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
export const adminStorage = adminApp.storage();
