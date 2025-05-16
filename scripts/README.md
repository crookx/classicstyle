
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
    Ensure your Firestore security rules allow the application to read the data. For initial setup, you might use rules like this (in Firebase Console -> Firestore Database -> Rules):
    ```json
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /products/{productId} {
          allow read: if true;
          // Write access for the script is handled by admin privileges
        }
        match /collections/{collectionId} {
          allow read: if true;
          // Write access for the script is handled by admin privileges
        }
      }
    }
    ```
4.  **Dependencies**: Install necessary packages by running the following command in your project's root directory:
    ```bash
    npm install --save-dev ts-node typescript @types/node
    npm install firebase-admin
    ```
    Or if using Yarn:
    ```bash
    yarn add --dev ts-node typescript @types/node
    yarn add firebase-admin
    ```

### How to Run

1.  Ensure all prerequisites are met, especially the `serviceAccountKey.json` file placement and Firestore rules.
2.  Open your terminal in the **root directory of your project**.
3.  Execute the script using the following command:

    ```bash
    npx ts-node --esm ./scripts/populateFirestore.ts
    ```

    (The `--esm` flag is important if your `tsconfig.json` has `"module": "esnext"` or similar for ES Module support, which is common in modern Next.js projects).

4.  The script will log its progress to the console. Upon successful completion, your `products` and `collections` collections in Firestore should be populated.

### Notes

*   The script uses batch writes to upload data efficiently.
*   If you run the script multiple times, it will overwrite existing documents if they have the same ID, or create new ones if the IDs are different. The current script uses predefined IDs from `mock-data.ts`.
*   The `databaseURL` in `populateFirestore.ts` should match your Firebase project's database URL (usually `https://<YOUR_PROJECT_ID>.firebaseio.com` or `https://<YOUR_PROJECT_ID>.firestore.io`). The script currently has a placeholder for `clothstore-25546`.
