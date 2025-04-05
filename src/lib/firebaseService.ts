
import { database } from "./firebase";
import { primeDatabase } from "./firebase-prime";
import { netflixDatabase } from "./firebase-netflix";
import { ref, get, set, remove, update, onValue, off, Database } from "firebase/database";
import { PlatformType } from "@/types/database";

// Factory function to create platform-specific service
export const createFirebaseService = (platform: PlatformType = 'default') => {
  let db: Database;
  
  switch (platform) {
    case 'prime':
      db = primeDatabase;
      break;
    case 'netflix':
      db = netflixDatabase;
      break;
    default:
      db = database; // Crunchyroll database is the default
  }
  
  // Database helper functions
  const fetchData = async (path: string) => {
    try {
      const dataRef = ref(db, path);
      const snapshot = await get(dataRef);
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error(`Error fetching data from ${platform} database:`, error);
      throw error;
    }
  };

  const updateData = async (path: string, data: any) => {
    try {
      const dataRef = ref(db, path);
      await update(dataRef, data);
      return data;
    } catch (error) {
      console.error(`Error updating data in ${platform} database:`, error);
      throw error;
    }
  };

  const setData = async (path: string, data: any) => {
    try {
      const dataRef = ref(db, path);
      await set(dataRef, data);
      return data;
    } catch (error) {
      console.error(`Error setting data in ${platform} database:`, error);
      throw error;
    }
  };

  const removeData = async (path: string) => {
    try {
      const dataRef = ref(db, path);
      await remove(dataRef);
      return true;
    } catch (error) {
      console.error(`Error removing data from ${platform} database:`, error);
      throw error;
    }
  };

  // Realtime listener functions
  const subscribeToData = (path: string, callback: (data: any) => void) => {
    try {
      const dataRef = ref(db, path);
      onValue(dataRef, (snapshot) => {
        const data = snapshot.exists() ? snapshot.val() : null;
        callback(data);
      });
      
      // Return unsubscribe function
      return () => off(dataRef);
    } catch (error) {
      console.error(`Error subscribing to data from ${platform} database:`, error);
      throw error;
    }
  };
  
  return {
    fetchData,
    updateData,
    setData,
    removeData,
    subscribeToData
  };
};

// Export default service instances for backward compatibility
export const {
  fetchData,
  updateData,
  setData,
  removeData,
  subscribeToData
} = createFirebaseService('default'); // Crunchyroll

export const {
  fetchData: fetchPrimeData,
  updateData: updatePrimeData,
  setData: setPrimeData,
  removeData: removePrimeData,
  subscribeToData: subscribeToPrimeData
} = createFirebaseService('prime');

export const {
  fetchData: fetchNetflixData,
  updateData: updateNetflixData,
  setData: setNetflixData,
  removeData: removeNetflixData,
  subscribeToData: subscribeToNetflixData
} = createFirebaseService('netflix');
