import * as admin from "firebase-admin";

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  // Handle both escaped newlines from env vars and actual newlines
  let formatted = key.replace(/\\n/g, "\n").replace(/"/g, '').trim(); 
  
  // If Vercel stripped newlines and it's all on one line (but contains BEGIN/END)
  if (formatted.startsWith('-----BEGIN PRIVATE KEY-----') && !formatted.includes('\n')) {
    const base64 = formatted
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s+/g, '');
    
    formatted = `-----BEGIN PRIVATE KEY-----\n${base64}\n-----END PRIVATE KEY-----\n`;
  }
  
  return formatted;
};

export const createFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy-project-id";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "dummy@dummy.com";
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY) || "dummy_key";

  try {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (error) {
    console.warn("Firebase Admin init failed with cert, falling back to default.", error);
    return admin.initializeApp();
  }
};

export const adminApp = createFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
export const adminStorage = adminApp.storage();
