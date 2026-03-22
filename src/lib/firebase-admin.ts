import * as admin from "firebase-admin";

const formatPrivateKey = (key?: string) => {
  if (!key) return undefined;
  
  let formatted = key;
  // If the user pasted the entire JSON object from Firebase Service Account
  try {
    const parsed = JSON.parse(key);
    if (parsed.private_key) {
      formatted = parsed.private_key;
    }
  } catch (e) {
    // Not valid JSON, proceed as string
  }

  // Handle escaped newlines and bounding quotes
  formatted = formatted.replace(/\\n/g, "\n").replace(/"/g, '').trim(); 
  
  // Foolproof Reconstructor for PEM formatted keys
  // Node.js crypto prefers PEM keys broken into 64-character lines.
  if (formatted.includes('BEGIN PRIVATE KEY') && formatted.includes('END PRIVATE KEY')) {
    const base64Payload = formatted
      .split('BEGIN PRIVATE KEY-----')[1]
      .split('-----END PRIVATE KEY')[0]
      .replace(/\s+/g, ''); // Blast away all spaces, newlines, tabs, etc.
      
    const chunks = base64Payload.match(/.{1,64}/g) || [];
    formatted = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----\n`;
  }
  
  return formatted;
};

export let adminInitError: Error | null = null;

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
  } catch (error: any) {
    console.warn("Firebase Admin init failed with cert.", error.message);
    adminInitError = error;
    // Return a dummy app so the module doesn't crash during build
    return admin.initializeApp({ projectId: "dummy-fallback" }, "dummy");
  }
};

export const adminApp = createFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminDb = adminApp.firestore();
export const adminStorage = adminApp.storage();
