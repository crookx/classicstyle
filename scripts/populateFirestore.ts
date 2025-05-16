
// HOW TO USE THIS SCRIPT:
// 1. Ensure you have Firebase Admin SDK installed: `npm install firebase-admin` or `yarn add firebase-admin`
// 2. Download your Firebase project's service account key JSON file.
//    - Go to Firebase Console -> Project Settings -> Service accounts.
//    - Click "Generate new private key" and save the JSON file.
//    - RENAME the downloaded file to "serviceAccountKey.json" and place it in the ROOT of your project (or update the path below).
//    - IMPORTANT: Add "serviceAccountKey.json" to your .gitignore file to prevent committing it to your repository.
// 3. Update `databaseURL` in `admin.initializeApp` if it's different for your project.
// 4. Run this script from your project's root directory: `npx ts-node --esm scripts/populateFirestore.ts` (if using ts-node with ESM)
//    or compile to JS first: `tsc scripts/populateFirestore.ts --module esnext --outDir dist_scripts`
//    then run: `node dist_scripts/populateFirestore.js`

import admin from 'firebase-admin';
import { productsToUpload, collectionsToUpload } from '../src/data/mock-data'; // Adjust path if necessary
import type { Product, Collection } from '../src/types'; // Adjust path if necessary

// Initialize Firebase Admin SDK
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require('../serviceAccountKey.json'); // IMPORTANT: Update this path if your key is elsewhere

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://clothstore-25546.firebaseio.com" // Replace with your actual databaseURL if different
});

const db = admin.firestore();

async function batchWriteProducts(products: Product[]) {
  const productsCollection = db.collection('products');
  const batch = db.batch();
  let operationsCount = 0;

  console.log(`Starting to upload ${products.length} products...`);

  for (const product of products) {
    const docRef = productsCollection.doc(product.id); // Use predefined ID for consistency
    // Convert undefined to null for Firestore compatibility
    const productDataForFirestore = Object.fromEntries(
      Object.entries(product).map(([key, value]) => [key, value === undefined ? null : value])
    );
    batch.set(docRef, productDataForFirestore);
    operationsCount++;

    if (operationsCount >= 490) { // Firestore batch limit is 500 operations
      console.log(`Committing batch of ${operationsCount} product operations...`);
      await batch.commit();
      // batch = db.batch(); // Re-initialize batch
      operationsCount = 0;
      console.log('Batch committed. Continuing...');
    }
  }

  if (operationsCount > 0) {
    console.log(`Committing final batch of ${operationsCount} product operations...`);
    await batch.commit();
  }

  console.log(`${products.length} products successfully uploaded to Firestore.`);
}

async function batchWriteCollections(collections: Collection[]) {
  const collectionsCollection = db.collection('collections');
  const batch = db.batch();
  let operationsCount = 0;

  console.log(`Starting to upload ${collections.length} collections...`);

  for (const collection of collections) {
    const docRef = collectionsCollection.doc(collection.id); // Use predefined ID
    const collectionDataForFirestore = Object.fromEntries(
      Object.entries(collection).map(([key, value]) => [key, value === undefined ? null : value])
    );
    batch.set(docRef, collectionDataForFirestore);
    operationsCount++;

    if (operationsCount >= 490) {
      console.log(`Committing batch of ${operationsCount} collection operations...`);
      await batch.commit();
      // batch = db.batch(); // Re-initialize
      operationsCount = 0;
      console.log('Batch committed. Continuing...');
    }
  }

  if (operationsCount > 0) {
    console.log(`Committing final batch of ${operationsCount} collection operations...`);
    await batch.commit();
  }
  console.log(`${collections.length} collections successfully uploaded to Firestore.`);
}


async function main() {
  try {
    console.log('Populating Firestore with new product and collection data...');
    
    // Clear existing collections (optional, be careful with this in production)
    // console.log('Clearing existing products collection...');
    // await deleteCollection(db, 'products', 100);
    // console.log('Clearing existing collections collection...');
    // await deleteCollection(db, 'collections', 100);
    // console.log('Existing data cleared (if any).');

    await batchWriteProducts(productsToUpload);
    await batchWriteCollections(collectionsToUpload);

    console.log('Firestore population complete!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

// Helper to delete all documents in a collection (use with caution)
// async function deleteCollection(dbInstance: admin.firestore.Firestore, collectionPath: string, batchSize: number) {
//   const collectionRef = dbInstance.collection(collectionPath);
//   const query = collectionRef.orderBy('__name__').limit(batchSize);

//   return new Promise((resolve, reject) => {
//     deleteQueryBatch(dbInstance, query, resolve).catch(reject);
//   });
// }

// async function deleteQueryBatch(dbInstance: admin.firestore.Firestore, query: admin.firestore.Query, resolve: (value?: unknown) => void) {
//   const snapshot = await query.get();

//   if (snapshot.size === 0) {
//     // When there are no documents left, we are done
//     resolve();
//     return;
//   }

//   // Delete documents in a batch
//   const batch = dbInstance.batch();
//   snapshot.docs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });
//   await batch.commit();

//   // Recurse on the next process tick, to avoid exploding the stack.
//   process.nextTick(() => {
//     deleteQueryBatch(dbInstance, query, resolve);
//   });
// }


main();
