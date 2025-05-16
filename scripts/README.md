
# Firestore Data Population Script

This directory contains scripts related to managing your application's data.

## `populateFirestore.ts`

This script is used to populate your Firebase Firestore database with initial product and collection data. The data is sourced from `src/data/mock-data.ts`.

### Prerequisites

1.  **Firebase Project**: Ensure you have a Firebase project set up and Firestore enabled.
2.  **Service Account Key**:
    *   Go to your Firebase Project Console -> Project settings (gear icon) -> Service accounts.
    *   Under "Firebase Admin SDK," select "Node.js" and click "Generate new private key."
    *   A JSON file will download. **Rename this file to `serviceAccountKey.json`** and place it in the **root directory of your project** (i.e., one level above this `scripts` directory).
    *   **IMPORTANT**: Add `serviceAccountKey.json` to your `.gitignore` file. This file contains sensitive credentials.
3.  **Firestore Security Rules**:
    Ensure your Firestore security rules allow the application to read the data and the admin script to write. For example:
    ```json
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /products/{productId} {
          allow read: if true;
          // Admin script writes bypass these, client writes need rules
        }
        match /collections/{collectionId} {
          allow read: if true;
        }
        match /orders/{orderId} {
          allow read: if request.auth != null; // Example: allow authenticated users
        }
      }
    }
    ```
    (The population script uses admin privileges, so it bypasses client-side write rules for initial population.)
4.  **Dependencies**: Install necessary packages by running the following command in your project's root directory:
    ```bash
    npm install --save-dev ts-node typescript @types/node
    npm install firebase-admin
    ```
    (You should already have `tsx` from `genkit-cli` which is preferred for running the script).
5.  **Package.json type**: Ensure your `package.json` in the project root contains `"type": "module"` to correctly run ESM scripts.

### How to Run

1.  Ensure all prerequisites are met, especially the `serviceAccountKey.json` file placement, Firestore rules, and `package.json` type setting.
2.  Open your terminal in the **root directory of your project**.
3.  Execute the script using `tsx`:

    ```bash
    npx tsx ./scripts/populateFirestore.ts
    ```

4.  The script will log its progress to the console. Upon successful completion, your `products`, `collections`, and `orders` collections in Firestore should be populated.

### Notes

*   The script uses batch writes to upload data efficiently.
*   If you run the script multiple times, it will overwrite existing documents if they have the same ID (for products and collections) or create new ones if the IDs are different. Orders are created with new auto-generated IDs each time.
*   The `databaseURL` in `populateFirestore.ts` should match your Firebase project's database URL (usually `https://<YOUR_PROJECT_ID>.firebaseio.com` or `https://<YOUR_PROJECT_ID>.firestore.io`).
*   The `serviceAccount` import in `populateFirestore.ts` is cast to `admin.ServiceAccount` to satisfy TypeScript.
*   Batches are re-initialized after each commit to prevent errors.

## `setAdminUser.ts`

This script is used to grant admin privileges to a Firebase Authentication user by setting a custom claim (`admin: true`).

### Prerequisites

1.  Same as `populateFirestore.ts` (Firebase Admin SDK setup, `serviceAccountKey.json`).
2.  The user you want to make an admin must already exist in Firebase Authentication.

### How to Run

1.  Ensure all prerequisites are met.
2.  Get the UID of the user you want to make an admin (from Firebase Console -> Authentication -> Users).
3.  Open your terminal in the **root directory of your project**.
4.  Execute the script using `tsx`, followed by the user's UID as an argument:

    ```bash
    npx tsx ./scripts/setAdminUser.ts <USER_UID_HERE>
    ```
    **Example:**
    ```bash
    npx tsx ./scripts/setAdminUser.ts abc123xyz789userUid
    ```
    **Important:** Make sure there is a space between `./scripts/setAdminUser.ts` and the `<USER_UID_HERE>`.

5.  The script will log whether the admin claim was set successfully.
6.  The user may need to log out and log back in for the new claim to take effect in the application.

