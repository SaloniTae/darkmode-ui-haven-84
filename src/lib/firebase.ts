
import { getDatabase, ref, get, child, update, remove, set } from "firebase/database";
import { initializeApp } from "firebase/app";

// Initialize Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Make sure all required config values are present
if (!firebaseConfig.projectId || !firebaseConfig.databaseURL) {
  console.error("Missing required Firebase configuration values. Check your environment variables.");
}

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const dbRef = ref(database);

// Fetch data from Firebase
export const fetchData = async (path: string) => {
  const snapshot = await get(child(dbRef, path));
  if (snapshot.exists()) {
    return snapshot.val();
  }
  return null;
};

// Set data in Firebase (replace)
export const setData = async (path: string, data: any) => {
  const reference = ref(database, path);
  return await set(reference, data);
};

// Update data in Firebase (merge)
export const updateData = async (path: string, data: any) => {
  const reference = ref(database, path);
  return await update(reference, typeof data === 'object' ? data : { value: data });
};

// Delete data from Firebase
export const deleteData = async (path: string) => {
  const reference = ref(database, path);
  return await remove(reference);
};

// Export removeData as an alias to deleteData for backward compatibility
export const removeData = deleteData;
