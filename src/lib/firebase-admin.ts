import * as admin from "firebase-admin";

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID || "dummy",
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "dummy@dummy.com",
  // Safe replace to prevent crash if undefined during build
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : "dummy_key",
};

export const createFirebaseAdminApp = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }
  
  // Conditionally initialize based on whether the dummy key is used or real key
  // Avoid errors during build
  try {
    return admin.initializeApp({
      credential: admin.credential.cert(firebaseAdminConfig),
    });
  } catch (error) {
    return admin.initializeApp(); // Fallback
  }
};

export const adminApp = createFirebaseAdminApp();
export const adminAuth = adminApp.auth();
export const adminStorage = adminApp.storage();
