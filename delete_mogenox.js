const admin = require('firebase-admin');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function deleteBadProfile() {
    try {
        const rawKey = process.env.FIREBASE_PRIVATE_KEY_BASE64 
          ? Buffer.from(process.env.FIREBASE_PRIVATE_KEY_BASE64, 'base64').toString('utf-8')
          : process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

        if (!admin.apps.length) {
            admin.initializeApp({
              credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: rawKey,
              }),
            });
        }

        const db = admin.firestore();
        const snapshot = await db.collection('profiles').where('username', '==', 'mogenox-design').get();

        if (snapshot.empty) {
            console.log("Profile 'mogenox-design' not found or already deleted.");
            return;
        }

        console.log(`Found ${snapshot.size} profile(s) with username 'mogenox-design'. Deleting...`);
        
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log("SUCCESS! Profile 'mogenox-design' has been removed.");
        console.log("The landing page should now show the 'Fallback' view.");
    } catch (e) {
        console.error("DELETION FAILED:", e.message);
    }
}

deleteBadProfile();
