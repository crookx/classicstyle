
import { db } from '@/lib/firebase';
import type { Product, Collection } from '@/types';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  limit,
  Timestamp, // If you decide to use Timestamps
  writeBatch,
  serverTimestamp,
  documentId
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const COLLECTIONS_COLLECTION = 'collections';

// Helper function to convert Firestore doc data to Product/Collection type
// Handles potential null values from Firestore and ensures type safety
const fromFirestore = <T extends { id: string }>(docSnap: ReturnType<typeof getDoc> | any): T | null => {
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();
  // Convert Timestamps to Date objects or string representations if necessary
  // For now, we assume Timestamps are handled or not used directly in the Product/Collection types
  // or that they are stored as strings/numbers if simpler.
  // Example: if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
  return { id: docSnap.id, ...data } as T;
};


export async function getProducts(count?: number): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = count ? query(productsRef, limit(count)) : productsRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export async function getFeaturedProducts(count: number = 6): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    const q = query(productsRef, where('isFeatured', '==', true), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}


export async function getProductById(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return fromFirestore<Product>(docSnap);
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }
  try {
    // Firestore 'in' query supports up to 30 elements per query.
    // For more, split into multiple queries.
    const CHUNK_SIZE = 30;
    const productPromises: Promise<Product[]>[] = [];

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        if (chunk.length > 0) {
             const productsRef = collection(db, PRODUCTS_COLLECTION);
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
    console.error("Error fetching products by IDs:", error);
    return [];
  }
}


export async function getProductsByCategoryId(categoryId: string, excludeProductId?: string, count: number = 4): Promise<Product[]> {
  try {
    const productsRef = collection(db, PRODUCTS_COLLECTION);
    let q = query(productsRef, where('category', '==', categoryId), limit(count + (excludeProductId ? 1 : 0) )); // Fetch one extra if excluding
    
    const querySnapshot = await getDocs(q);
    let products = querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
    
    if (excludeProductId) {
      products = products.filter(p => p.id !== excludeProductId);
    }
    
    return products.slice(0, count);
  } catch (error) {
    console.error(`Error fetching products for category ${categoryId}:`, error);
    return [];
  }
}


export async function getCollections(count?: number): Promise<Collection[]> {
  try {
    const collectionsRef = collection(db, COLLECTIONS_COLLECTION);
    const q = count ? query(collectionsRef, limit(count)) : collectionsRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Collection>(docSnap)).filter(c => c !== null) as Collection[];
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  try {
    const collectionsRef = collection(db, COLLECTIONS_COLLECTION);
    const q = query(collectionsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    return fromFirestore<Collection>(querySnapshot.docs[0]);
  } catch (error) {
    console.error(`Error fetching collection with slug ${slug}:`, error);
    return null;
  }
}

// For Admin: Add Product
export async function addProduct(productData: Omit<Product, 'id'>): Promise<Product | null> {
  try {
    // Add server-side timestamp for creation
    const dataWithTimestamp = {
      ...productData,
      // createdAt: serverTimestamp(), // Example if using server timestamps
      // updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), dataWithTimestamp);
    return { id: docRef.id, ...productData } as Product; // Return with the new ID
  } catch (error) {
    console.error("Error adding product to Firestore:", error);
    return null;
  }
}

// Placeholder for updating a product
// export async function updateProduct(productId: string, productData: Partial<Product>): Promise<boolean> {
//   try {
//     const docRef = doc(db, PRODUCTS_COLLECTION, productId);
//     await updateDoc(docRef, { ...productData, updatedAt: serverTimestamp() });
//     return true;
//   } catch (error) {
//     console.error(`Error updating product ${productId}:`, error);
//     return false;
//   }
// }

// Placeholder for deleting a product
// export async function deleteProduct(productId: string): Promise<boolean> {
//   try {
//     const docRef = doc(db, PRODUCTS_COLLECTION, productId);
//     await deleteDoc(docRef);
//     return true;
//   } catch (error) {
//     console.error(`Error deleting product ${productId}:`, error);
//     return false;
//   }
// }

