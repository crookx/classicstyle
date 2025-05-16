
import { db } from '@/lib/firebase';
import type { Product, Collection, Order, UserProfile, OrderStatus, UserCartItem, UserCartDocument, UserWishlistDocument, UserWishlistItem } from '@/types';
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
  setDoc,
  runTransaction,
  arrayUnion,
  arrayRemove,
  orderBy
} from 'firebase/firestore';

const PRODUCTS_COLLECTION = 'products';
const COLLECTIONS_COLLECTION = 'collections';
const ORDERS_COLLECTION = 'orders';
const USERS_COLLECTION = 'users';
const CARTS_COLLECTION = 'carts';
const WISHLISTS_COLLECTION = 'wishlists';


const fromFirestore = <T extends { id: string }>(docSnap: ReturnType<typeof getDoc> | any): T | null => {
  if (!docSnap.exists()) {
    return null;
  }
  const data = docSnap.data();

  const convertTimestamps = (obj: any): any => {
    if (!obj) return obj;
    if (Array.isArray(obj)) {
        return obj.map(item => convertTimestamps(item));
    }
    if (typeof obj !== 'object') return obj;

    const newObj: {[key: string]: any} = {};
    for (const key in obj) {
      if (obj[key] instanceof Timestamp) {
        newObj[key] = obj[key].toDate().toISOString();
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        newObj[key] = convertTimestamps(obj[key]);
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  };


  const dataWithConvertedTimestamps = convertTimestamps({ ...data });

  return { id: docSnap.id, ...dataWithConvertedTimestamps } as T;
};


export async function getProducts(count?: number): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] getProducts: Attempting to read from collection: '${collectionPath}'.`);
  try {
    const productsRef = collection(db, collectionPath);
    const q = count ? query(productsRef, orderBy("createdAt", "desc"), limit(count)) : query(productsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error(`[FirestoreService] getProducts: Error fetching products from '${collectionPath}':`, error);
    return [];
  }
}

export async function getProductsCount(): Promise<number> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] getProductsCount: Attempting to count documents in collection: '${collectionPath}'.`);
  try {
    const productsRef = collection(db, collectionPath);
    const snapshot = await getCountFromServer(productsRef);
    return snapshot.data().count;
  } catch (error) {
    console.error(`[FirestoreService] getProductsCount: Error counting products in '${collectionPath}':`, error);
    return 0;
  }
}

export async function getFeaturedProducts(count: number = 6): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] getFeaturedProducts: Attempting to read from collection: '${collectionPath}' with 'isFeatured' filter.`);
  try {
    const productsRef = collection(db, collectionPath);
    const q = query(productsRef, where('isFeatured', '==', true), orderBy("createdAt", "desc"), limit(count));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Product>(docSnap)).filter(p => p !== null) as Product[];
  } catch (error) {
    console.error(`[FirestoreService] getFeaturedProducts: Error fetching featured products from '${collectionPath}':`, error);
    return [];
  }
}


export async function getProductById(id: string): Promise<Product | null> {
  if (!id) {
    console.warn("[FirestoreService] getProductById: Called with null or undefined ID.");
    return null;
  }
  const docPath = `${PRODUCTS_COLLECTION}/${id}`;
  console.log(`[FirestoreService] getProductById: Attempting to read document: '${docPath}'.`);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    return fromFirestore<Product>(docSnap);
  } catch (error) {
    console.error(`[FirestoreService] getProductById: Error fetching product with ID ${id} from '${docPath}':`, error);
    return null;
  }
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (!ids || ids.length === 0) {
    return [];
  }
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] getProductsByIds: Attempting to read from collection: '${collectionPath}' for IDs: ${ids.join(', ')}.`);
  try {
    const CHUNK_SIZE = 30;
    const productPromises: Promise<Product[]>[] = [];

    for (let i = 0; i < ids.length; i += CHUNK_SIZE) {
        const chunk = ids.slice(i, i + CHUNK_SIZE);
        if (chunk.length > 0) {
             const productsRef = collection(db, collectionPath);
             // Firestore 'in' queries are limited to 30 items in the array
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
    console.error(`[FirestoreService] getProductsByIds: Error fetching products by IDs from '${collectionPath}':`, error);
    return [];
  }
}


export async function getProductsByCategoryId(categoryId: string, excludeProductId?: string, count: number = 4): Promise<Product[]> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] getProductsByCategoryId: Attempting to read from collection: '${collectionPath}' for category '${categoryId}'.`);
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
    console.error(`[FirestoreService] getProductsByCategoryId: Error fetching products for category ${categoryId} from '${collectionPath}':`, error);
    return [];
  }
}


export async function getCollections(count?: number): Promise<Collection[]> {
  const collectionPath = COLLECTIONS_COLLECTION;
  console.log(`[FirestoreService] getCollections: Attempting to read from collection: '${collectionPath}'.`);
  try {
    const collectionsRef = collection(db, collectionPath);
    const q = count ? query(collectionsRef, limit(count)) : collectionsRef;
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Collection>(docSnap)).filter(c => c !== null) as Collection[];
  } catch (error) {
    console.error(`[FirestoreService] getCollections: Error fetching collections from '${collectionPath}':`, error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const collectionPath = COLLECTIONS_COLLECTION;
  console.log(`[FirestoreService] getCollectionBySlug: Attempting to read from collection: '${collectionPath}' for slug '${slug}'.`);
  try {
    const collectionsRef = collection(db, collectionPath);
    const q = query(collectionsRef, where('slug', '==', slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      console.log(`[FirestoreService] getCollectionBySlug: No collection found with slug '${slug}'.`);
      return null;
    }
    return fromFirestore<Collection>(querySnapshot.docs[0]);
  } catch (error) {
    console.error(`[FirestoreService] getCollectionBySlug: Error fetching collection with slug ${slug} from '${collectionPath}':`, error);
    return null;
  }
}

export async function addProduct(productData: Omit<Product, 'id' | 'rating' | 'reviewCount'>): Promise<Product | null> {
  const collectionPath = PRODUCTS_COLLECTION;
  console.log(`[FirestoreService] addProduct: Attempting to write to collection: '${collectionPath}'. Data:`, productData);
  try {
    const dataWithTimestamp = {
      ...productData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, collectionPath), dataWithTimestamp);
    // For optimistic update, we create a client-side version of the product
    // Timestamps will be resolved by Firestore, but we can approximate for immediate UI.
    return { id: docRef.id, ...productData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as Product;
  } catch (error) {
    console.error(`[FirestoreService] addProduct: Error adding product to Firestore collection '${collectionPath}':`, error);
    throw error; // Re-throw to be caught by server action
  }
}

export async function updateProduct(productId: string, productData: Partial<Omit<Product, 'id'>>): Promise<boolean> {
  const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
  console.log(`[FirestoreService] updateProduct: Attempting to update document: '${docPath}'. Data:`, productData);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await updateDoc(docRef, { ...productData, updatedAt: serverTimestamp() });
    return true;
  } catch (error) {
    console.error(`[FirestoreService] updateProduct: Error updating product with ID ${productId} in '${docPath}':`, error);
    throw error; // Re-throw to be caught by server action
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const docPath = `${PRODUCTS_COLLECTION}/${productId}`;
  console.log(`[FirestoreService] deleteProduct: Attempting to delete document: '${docPath}'.`);
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.error(`[FirestoreService] deleteProduct: Error deleting product with ID ${productId} from '${docPath}':`, error);
    throw error; // Re-throw to be caught by server action
  }
}

export async function getOrders(count?: number): Promise<Order[]> {
  const collectionPath = ORDERS_COLLECTION;
  console.log(`[FirestoreService] getOrders: Attempting to read from collection: '${collectionPath}'.`);
  try {
    const ordersRef = collection(db, collectionPath);
    const q = count ? query(ordersRef, orderBy("orderDate", "desc"), limit(count)) : query(ordersRef, orderBy("orderDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Order>(docSnap)).filter(o => o !== null) as Order[];
  } catch (error) {
    console.error(`[FirestoreService] getOrders: Error fetching orders from '${collectionPath}':`, error);
    return [];
  }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const docPath = `${ORDERS_COLLECTION}/${orderId}`;
  console.log(`[FirestoreService] getOrderById: Attempting to read document: '${docPath}'.`);
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    return fromFirestore<Order>(docSnap);
  } catch (error) {
    console.error(`[FirestoreService] getOrderById: Error fetching order with ID ${orderId} from '${docPath}':`, error);
    return null;
  }
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const collectionPath = ORDERS_COLLECTION;
  console.log(`[FirestoreService] getOrdersByUserId: Attempting to read from collection: '${collectionPath}' for userId: ${userId}.`);
  try {
    const ordersRef = collection(db, collectionPath);
    const q = query(ordersRef, where('userId', '==', userId), orderBy("orderDate", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(docSnap => fromFirestore<Order>(docSnap)).filter(o => o !== null) as Order[];
  } catch (error) {
    console.error(`[FirestoreService] getOrdersByUserId: Error fetching orders for user ${userId} from '${collectionPath}':`, error);
    return [];
  }
}

// Note: updateOrderStatus is now primarily handled by server action using Admin SDK for permissions.
// This client-side version might be useful for optimistic updates if rules allowed user to update their own order status, but that's not the case here.
// For now, it's effectively replaced by the server action. I'll keep it commented for reference.
/*
export async function updateOrderStatusInFirestore(orderId: string, status: OrderStatus): Promise<boolean> {
  const docPath = `${ORDERS_COLLECTION}/${orderId}`;
  const dataToUpdate = { status: status, updatedAt: serverTimestamp() };
  console.log(`[FirestoreService] updateOrderStatusInFirestore (Client SDK): Attempting to update status for order: '${docPath}' to '${status}'.`);
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(docRef, dataToUpdate);
    console.log(`[FirestoreService] updateOrderStatusInFirestore (Client SDK): Successfully updated status for order ${orderId}.`);
    return true;
  } catch (error: any) {
    console.error(`[FirestoreService] updateOrderStatusInFirestore (Client SDK): Firebase error updating status for order ${orderId}.`);
    if (error.code) {
      console.error(`Firebase Error Code: ${error.code}, Message: ${error.message}`);
    } else {
      console.error(`General Error: ${error.message}`, error);
    }
    console.error("Full error object from Firebase:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw error; // Re-throw to be caught by the server action or calling function
  }
}
*/

export async function addUserProfile(uid: string, email: string, displayName?: string | null): Promise<boolean> {
  const docPath = `${USERS_COLLECTION}/${uid}`;
  console.log(`[FirestoreService] addUserProfile (auth context): Creating user profile: '${docPath}' for new auth user.`);
  try {
    const userProfileData: Omit<UserProfile, 'id'> = {
      email: email,
      displayName: displayName || null,
      createdAt: serverTimestamp(),
      firstName: null,
      lastName: null,
      phone: null,
      photoURL: null,
    };
    await setDoc(doc(db, USERS_COLLECTION, uid), userProfileData);
    return true;
  } catch (error) {
    console.error(`[FirestoreService] addUserProfile (auth context): Error creating user profile for UID ${uid} in '${docPath}':`, error);
    return false;
  }
}

export async function addUserProfileByAdmin(profileData: Omit<UserProfile, 'id' | 'createdAt' | 'photoURL'>): Promise<UserProfile | null> {
  const collectionPath = USERS_COLLECTION;
  console.log(`[FirestoreService] addUserProfileByAdmin: Attempting to create user profile by admin:`, profileData);
  try {
    const dataWithTimestamp = {
      ...profileData,
      createdAt: serverTimestamp(),
      displayName: profileData.displayName || null,
      firstName: profileData.firstName || null,
      lastName: profileData.lastName || null,
      phone: profileData.phone || null,
      photoURL: null,
    };
    const docRef = await addDoc(collection(db, collectionPath), dataWithTimestamp);
    const newDocSnap = await getDoc(docRef);
    return fromFirestore<UserProfile>(newDocSnap);
  } catch (error) {
    console.error(`[FirestoreService] addUserProfileByAdmin: Error adding user profile to Firestore collection '${collectionPath}':`, error);
    return null;
  }
}


export async function getUsers(count?: number): Promise<UserProfile[]> {
  const collectionPath = USERS_COLLECTION;
  console.log(`[FirestoreService] getUsers: Attempting to read from collection: '${collectionPath}'.`);
  try {
    const usersRef = collection(db, collectionPath);
    const q = count ? query(usersRef, limit(count)) : usersRef;
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(docSnap => fromFirestore<UserProfile>(docSnap)).filter(u => u !== null) as UserProfile[];
    console.log(`[FirestoreService] getUsers: Successfully fetched ${users.length} user(s) from '${collectionPath}'.`);
    return users;
  } catch (error: any) {
    console.error(`[FirestoreService] getUsers: Error fetching users from '${collectionPath}'. Check Firestore permissions. Error details:`, error, "Message:", error.message, "Code:", error.code);
    return [];
  }
}

export async function getUserById(userId: string): Promise<UserProfile | null> {
  const docPath = `${USERS_COLLECTION}/${userId}`;
  console.log(`[FirestoreService] getUserById: Attempting to read document: '${docPath}'.`);
  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const docSnap = await getDoc(docRef);
    return fromFirestore<UserProfile>(docSnap);
  } catch (error) {
    console.error(`[FirestoreService] getUserById: Error fetching user with ID ${userId} from '${docPath}':`, error);
    return null;
  }
}

// Cart Firestore Functions
export async function getUserCart(userId: string): Promise<UserCartDocument | null> {
  if (!userId) return null;
  const docRef = doc(db, CARTS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return fromFirestore<UserCartDocument>(docSnap);
  }
  // If cart doesn't exist, create an empty one
  const newCart: UserCartDocument = { userId, items: [], lastUpdatedAt: serverTimestamp() };
  await setDoc(docRef, newCart);
  return { ...newCart, lastUpdatedAt: new Date().toISOString() }; // Return with resolved timestamp for consistency
}

export async function addItemToCart(userId: string, item: UserCartItem): Promise<void> {
  if (!userId) throw new Error("User ID is required to add item to cart.");
  const cartRef = doc(db, CARTS_COLLECTION, userId);
  // Check if item already exists, if so, update quantity, otherwise add new item
  // This simplified version just adds or updates, assuming quantity handling is done before calling
  await updateDoc(cartRef, {
    items: arrayUnion(item), // This will add if not present based on object equality (might not work as expected for updates)
    lastUpdatedAt: serverTimestamp(),
  });
   // A more robust way would be to read, modify, write or use transactions for quantity updates.
   // For simplicity, we'll handle quantity logic in the context for now and fetchAndPopulate.
}

export async function updateCartItemQuantity(userId: string, productId: string, newQuantity: number): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  const cartRef = doc(db, CARTS_COLLECTION, userId);
  await runTransaction(db, async (transaction) => {
    const cartDoc = await transaction.get(cartRef);
    if (!cartDoc.exists()) {
      // Create cart if it doesn't exist (though getUserCart should handle this)
      transaction.set(cartRef, { userId, items: [{ productId, quantity: newQuantity, addedAt: serverTimestamp() }], lastUpdatedAt: serverTimestamp() });
      return;
    }
    const items = (cartDoc.data()?.items as UserCartItem[]) || [];
    const itemIndex = items.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      items[itemIndex].quantity = newQuantity;
    } else if (newQuantity > 0) { // Add if not found and quantity is positive
      items.push({ productId, quantity: newQuantity, addedAt: serverTimestamp() });
    }
    const updatedItems = items.filter(item => item.quantity > 0); // Remove if quantity is 0
    transaction.update(cartRef, { items: updatedItems, lastUpdatedAt: serverTimestamp() });
  });
}

export async function removeItemFromCart(userId: string, productId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  const cartRef = doc(db, CARTS_COLLECTION, userId);
   await runTransaction(db, async (transaction) => {
    const cartDoc = await transaction.get(cartRef);
    if (!cartDoc.exists()) return;
    const items = (cartDoc.data()?.items as UserCartItem[]) || [];
    const updatedItems = items.filter(item => item.productId !== productId);
    transaction.update(cartRef, { items: updatedItems, lastUpdatedAt: serverTimestamp() });
  });
}

export async function clearUserCart(userId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  const cartRef = doc(db, CARTS_COLLECTION, userId);
  await updateDoc(cartRef, {
    items: [],
    lastUpdatedAt: serverTimestamp(),
  });
}


// Wishlist Firestore Functions
export async function getUserWishlist(userId: string): Promise<UserWishlistDocument | null> {
  if (!userId) return null;
  const docRef = doc(db, WISHLISTS_COLLECTION, userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return fromFirestore<UserWishlistDocument>(docSnap);
  }
  // If wishlist doesn't exist, create an empty one
  const newWishlist: UserWishlistDocument = { userId, productIds: [], lastUpdatedAt: serverTimestamp() };
  await setDoc(docRef, newWishlist);
  return { ...newWishlist, lastUpdatedAt: new Date().toISOString() };
}

export async function addProductToWishlist(userId: string, productId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  const wishlistRef = doc(db, WISHLISTS_COLLECTION, userId);
  await updateDoc(wishlistRef, {
    productIds: arrayUnion(productId),
    lastUpdatedAt: serverTimestamp(),
  });
}

export async function removeProductFromWishlist(userId: string, productId: string): Promise<void> {
  if (!userId) throw new Error("User ID is required.");
  const wishlistRef = doc(db, WISHLISTS_COLLECTION, userId);
  await updateDoc(wishlistRef, {
    productIds: arrayRemove(productId),
    lastUpdatedAt: serverTimestamp(),
  });
}

// Stock Update Function with Transaction
export async function runStockUpdateTransaction(orderItems: { productId: string; quantity: number }[]): Promise<void> {
  console.log("[FirestoreService] runStockUpdateTransaction: Starting for order items:", orderItems);
  try {
    await runTransaction(db, async (transaction) => {
      for (const item of orderItems) {
        const productRef = doc(db, PRODUCTS_COLLECTION, item.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error(`Product with ID ${item.productId} not found.`);
        }

        const currentStock = productDoc.data().stock as number;
        if (currentStock < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}. Available: ${currentStock}, Requested: ${item.quantity}`);
        }

        const newStock = currentStock - item.quantity;
        transaction.update(productRef, { stock: newStock, updatedAt: serverTimestamp() });
        console.log(`[FirestoreService] runStockUpdateTransaction: Product ${item.productId} stock updated from ${currentStock} to ${newStock}.`);
      }
    });
    console.log("[FirestoreService] runStockUpdateTransaction: Transaction committed successfully.");
  } catch (error) {
    console.error("[FirestoreService] runStockUpdateTransaction: Transaction failed:", error);
    throw error; // Re-throw to be handled by the server action
  }
}
