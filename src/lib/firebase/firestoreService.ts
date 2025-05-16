
import { db } from '@/lib/firebase';
import type { Product, Collection, Order, UserProfile, OrderStatus } from '@/types';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query, 
  where, 
  limit,
  Timestamp, 
  writeBatch,
  serverTimestamp,
  documentId,
  getCountFromServer,
  setDoc // For setting a document with a specific ID (e.g., user profiles)
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const COLLECTIONS_COLLECTION = 'collections';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';


const fromFirestore = <T extends { id: string }>(docSnap: ReturnType<typeof getDoc> | any): T | null => {
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  
  // Convert known Firestore Timestamps to JS Date objects or ISO strings
  const convertTimestamps = (obj: any) => {
    for (const key in obj) {
      if (obj[key] instanceof Timestamp) {
        obj[key] = obj[key].toDate().toISOString(); // Or .toDate() if you prefer Date objects
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        convertTimestamps(obj[key]); // Recurse for nested objects
      }
    }
  };

  // Apply timestamp conversion to a copy to avoid modifying the original snapshot data
  const dataWithConvertedTimestamps = { ...data };
  convertTimestamps(dataWithConvertedTimestamps);
  
  return { id: docSnap.id, ...dataWithConvertedTimestamps } as T;
};


export async function getProducts(count?: number): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getProducts.`);
  try {
    const productsRef = collection(db, collectionPath);
    const q = count ? query(productsRef, limit(count)) : productsRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error(`[FirestoreService] Error fetching products from '${collectionPath}':`, error);
    return [];
  }
}

export async function getProductsCount(): Promise<number> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to count documents in collection: '${collectionPath}'.`);
  try {
    const productsRef = collection(db, collectionPath);
    const snapshot = await getCountFromServer(productsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error(`[FirestoreService] Error counting products in '${collectionPath}':`, error);
    return 0;
  }
}

export async function getFeaturedProducts(count: number = 6): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getFeaturedProducts with 'isFeatured' filter.`);
  try {
    const productsRef = collection(db, collectionPath);
    const q = query(productsRef, where('isFeatured', '==', true), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error(`[FirestoreService] Error fetching featured products from '${collectionPath}':`, error);
    return [];
  }
}


export async function getProductById(id: string): Promise<Product | null> {
  const docPath = `${PRODUCTS_COLLECTION}/${id}`;
  console.log(`[FirestoreService] Attempting to read document: '${docPath}'.`);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return fromFirestore<Product>(docSnap);
  } catch (error) {
    console.error(`[FirestoreService] Error fetching product with ID ${id} from '${docPath}':`, error);
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getProductsByIds.`);
  try {
    const CHUNK_SIZE = 30; // Firestore 'in' query limit is 30
    const productPromises: Promise<Product[]>[] = [];

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        if (chunk.length > 0) {
             const productsRef = collection(db, collectionPath);
             const q = query(productsRef, where(documentId(), 'in', chunk));
             productPromises.push(
                getDocs(q).then(snapshot => 
                    snapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[]
                )
            );
        }
    }
    const results = await Promise.all(productPromises);
    return results.flat();

  } catch (error) {
    console.error(`[FirestoreService] Error fetching products by IDs from '${collectionPath}':`, error);
    return [];
  }
}


export async function getProductsByCategoryId(categoryId: string, excludeProductId?: string, count: number = 4): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getProductsByCategoryId with category '${categoryId}'.`);
  try {
    const productsRef = collection(db, collectionPath);
    let q = query(productsRef, where('category', '==', categoryId), limit(count + (excludeProductId ? 1 : 0) )); 
    
    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
    
    if (excludeProductId) {
      products = products.filter(p => p.id !== excludeProductId);
    }
    
    return products.slice(0, count);
  } catch (error)
{
    console.error(`[FirestoreService] Error fetching products for category ${categoryId} from '${collectionPath}':`, error);
    return [];
  }
}


export async function getCollections(count?: number): Promise<Collection[]> {
  const collectionPath = COLLECTIONS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getCollections.`);
  try {
    const collectionsRef = collection(db, collectionPath);
    const q = count ? query(collectionsRef, limit(count)) : collectionsRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Collection>(docSnap)).filter(c => c !== null) as Collection[];
  } catch (error) {
    console.error(`[FirestoreService] Error fetching collections from '${collectionPath}':`, error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collectionPath = COLLECTIONS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getCollectionBySlug with slug '${slug}'.`);
  try {
    const collectionsRef = collection(db, collectionPath);
    const q = query(collectionsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return fromFirestore<Collection>(querySnapshot.docs[0]);
  } catch (error) {
    console.error(`[FirestoreService] Error fetching collection with slug ${slug} from '${collectionPath}':`, error);
    return null;
  }
}

export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] Attempting to write to collection: '${collectionPath}' for addProduct.`);
  try {
    const dataWithTimestamp = {
      ...productData,
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, collectionPath), dataWithTimestamp);
    return { id: docRef.id, ...productData } as Product; // Timestamps will be set by server
  } catch (error) {
    console.error(`[FirestoreService] Error adding product to Firestore collection '${collectionPath}':`, error);
    return null;
  }
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<boolean> {
  const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
  console.log(`[FirestoreService] Attempting to update document: '${docPath}'.`);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { ...productData, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error(`[FirestoreService] Error updating product with ID ${productId} in '${docPath}':`, error);
    return false;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
  console.log(`[FirestoreService] Attempting to delete document: '${docPath}'.`);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`[FirestoreService] Error deleting product with ID ${productId} from '${docPath}':`, error);
    return false;
  }
}

export async function getOrders(count?: number): Promise<Order[]> {
  const collectionPath = ORDERS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getOrders.`);
  try {
    const ordersRef = collection(db, collectionPath);
    const q = count ? query(ordersRef, limit(count)) : query(ordersRef); // Removed default sort for now
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Order>(docSnap)).filter(o => o !== null) as Order[];
  } catch (error) {
    console.error(`[FirestoreService] Error fetching orders from '${collectionPath}':`, error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docPath = `${ORDERS_COLLECTION}/${orderId}`;
  console.log(`[FirestoreService] Attempting to read document: '${docPath}'.`);
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    return fromFirestore<Order>(docSnap);
  } catch (error) {
    console.error(`[FirestoreService] Error fetching order with ID ${orderId} from '${docPath}':`, error);
    return null;
  }
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
  const docPath = `${ORDERS_COLLECTION}/${orderId}`;
  console.log(`[FirestoreService] Attempting to update status for order: '${docPath}'.`);
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, { status: status, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error(`[FirestoreService] Error updating status for order ${orderId} in '${docPath}':`, error);
    return false;
  }
}

export async function addUserProfile(uid: string, email: string, displayName?: string | null): Promise<boolean> {
  const docPath = `${USERS_COLLECTION}/${uid}`;
  console.log(`[FirestoreService] Attempting to create user profile: '${docPath}'.`);
  try {
    const userProfileData: Omit<UserProfile, 'id'> = {
      email: email,
      displayName: displayName || null,
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), userProfileData);
    return true;
  } catch (error) {
    console.error(`[FirestoreService] Error creating user profile for UID ${uid} in '${docPath}':`, error);
    return false;
  }
}

export async function getUsers(count?: number): Promise<UserProfile[]> {
  const collectionPath = USERS_COLLECTION;
  console.log(`[FirestoreService] Attempting to read from collection: '${collectionPath}' for getUsers.`);
  try {
    const usersRef = collection(db, collectionPath);
    const q = count ? query(usersRef, limit(count)) : usersRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<UserProfile>(docSnap)).filter(u => u !== null) as UserProfile[];
  } catch (error) {
    console.error(`[FirestoreService] Error fetching users from '${collectionPath}':`, error);
    return [];
  }
}
