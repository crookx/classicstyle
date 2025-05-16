
// HOW TO USE THIS SCRIPT:
// 1. Ensure you have Firebase Admin SDK installed: `npm install firebase-admin`
// 2. Make sure you have ts-node and typescript installed as dev dependencies: `npm install --save-dev ts-node typescript @types/node`
// 3. Ensure your project's `package.json` has `"type": "module"`.
// 4. Download your Firebase project's service account key JSON file.
//    - Go to Firebase Console -> Project Settings -> Service accounts.
//    - Click "Generate new private key" and save the JSON file.
//    - RENAME the downloaded file to "serviceAccountKey.json" and place it in the ROOT of your project.
//    - IMPORTANT: Add "serviceAccountKey.json" to your .gitignore file.
// 5. Get the UID of the user you want to make an admin (from Firebase Console -> Authentication -> Users).
// 6. Run this script from your project's root directory using:
//    `npx tsx ./scripts/setAdminUser.ts <USER_UID_HERE>`
//    Replace <USER_UID_HERE> with the actual UID.

import admin from 'firebase-admin';
import serviceAccount from '../serviceAccountKey.json'; // ESM style import

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Cast to satisfy type
    databaseURL: "https://clothstore-25546.firebaseio.com" // Optional if not using Realtime DB
  });
  console.log('Firebase Admin SDK initialized successfully.');
} catch (error: any) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase Admin SDK already initialized.');
    // admin.app() is the already initialized app
  } else {
    console.error('Firebase Admin SDK initialization error:', error);
    process.exit(1);
  }
}


async function setAdminClaim(uid: string) {
  if (!uid) {
    console.error('Error: UID is required. Please provide the user UID as an argument.');
    console.log('Usage: npx tsx ./scripts/setAdminUser.ts <USER_UID_HERE>');
    return;
  }

  try {
    // Set custom user claims on an existing user.
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set admin claim for user: ${uid}`);
    
    // To verify, you can fetch the user record (optional)
    // const userRecord = await admin.auth().getUser(uid);
    // console.log('Updated user claims:', userRecord.customClaims);

  } catch (error) {
    console.error('Error setting custom claims:', error);
  }
}

// Get UID from command line arguments
const uid = process.argv[2];
setAdminClaim(uid);
