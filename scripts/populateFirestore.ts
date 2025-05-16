
// HOW TO USE THIS SCRIPT:
// 1. Ensure you have Firebase Admin SDK installed: `npm install firebase-admin` or `yarn add firebase-admin`
// 2. Make sure you have tsx installed: `npm install --save-dev tsx` or be able to run ts-node.
// 3. Download your Firebase project's service account key JSON file.
//    - Go to Firebase Console -> Project Settings -> Service accounts.
//    - Click "Generate new private key" and save the JSON file.
//    - RENAME the downloaded file to "serviceAccountKey.json" and place it in the ROOT of your project (one level above the 'scripts' directory).
//    - IMPORTANT: Add "serviceAccountKey.json" to your .gitignore file to prevent committing it to your repository.
// 4. Update `databaseURL` in `admin.initializeApp` if it's different for your project.
// 5. Run this script from your project's root directory using the command specified in scripts/README.md

import admin from 'firebase-admin';
import { productsToUpload, collectionsToUpload, ordersToUpload } from '../src/data/mock-data';
import type { Product, Collection, Order } from '../src/types';

// Import the service account key using ESM syntax
// Ensure your tsconfig.json has "resolveJsonModule": true and "esModuleInterop": true
import serviceAccount from '../serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount), // Cast to satisfy type
  databaseURL: "https://clothstore-25546.firebaseio.com"
});

const db = admin.firestore();

async function batchWriteProducts(products: Product[]) {
  const productsCollection = db.collection('products');
  let batch = db.batch();
  let operationsCount = 0;

  console.log(`Starting to upload ${products.length} products...`);

  for (const product of products) {
    const docRef = productsCollection.doc(product.id);
    // Ensure all fields, including stock, are included
    const productDataForFirestore = {
        ...product,
        // Convert undefined to null for Firestore compatibility if necessary, though Product type aims to avoid undefined
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(docRef, productDataForFirestore);
    operationsCount++;

    if (operationsCount >= 490) {
      console.log(`Committing batch of ${operationsCount} product operations...`);
      await batch.commit();
      batch = db.batch();
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
  let batch = db.batch();
  let operationsCount = 0;

  console.log(`Starting to upload ${collections.length} collections...`);

  for (const collection of collections) {
    const docRef = collectionsCollection.doc(collection.id);
    const collectionDataForFirestore = {
        ...collection,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(docRef, collectionDataForFirestore);
    operationsCount++;

    if (operationsCount >= 490) {
      console.log(`Committing batch of ${operationsCount} collection operations...`);
      await batch.commit();
      batch = db.batch();
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

async function batchWriteOrders(orders: Omit<Order, 'id'>[]) {
  const ordersCollection = db.collection('orders');
  let batch = db.batch();
  let operationsCount = 0;

  console.log(`Starting to upload ${orders.length} orders...`);

  for (const order of orders) {
    const docRef = ordersCollection.doc(); // Auto-generate ID
    const orderDataForFirestore = {
        ...order,
        orderDate: order.orderDate ? new Date(order.orderDate) : admin.firestore.FieldValue.serverTimestamp(), // Convert string date to JS Date for Firestore
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(docRef, orderDataForFirestore);
    operationsCount++;

    if (operationsCount >= 490) {
      console.log(`Committing batch of ${operationsCount} order operations...`);
      await batch.commit();
      batch = db.batch();
      operationsCount = 0;
      console.log('Order batch committed. Continuing...');
    }
  }

  if (operationsCount > 0) {
    console.log(`Committing final batch of ${operationsCount} order operations...`);
    await batch.commit();
  }
  console.log(`${orders.length} orders successfully uploaded to Firestore.`);
}


async function main() {
  try {
    console.log('Populating Firestore with new product, collection, and order data...');

    await batchWriteProducts(productsToUpload);
    await batchWriteCollections(collectionsToUpload);
    await batchWriteOrders(ordersToUpload);

    console.log('Firestore population complete!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

main();
