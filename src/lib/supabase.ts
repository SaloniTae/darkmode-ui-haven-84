
import { createClient } from "@supabase/supabase-js";

// Use environment variables when available, fallback to hardcoded for development
const supabaseUrl = "https://rqtncenvanahxthockwn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdG5jZW52YW5haHh0aG9ja3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjEyMzMsImV4cCI6MjA1ODYzNzIzM30.QcAlzMuhNUAEzZnmuQZyJ_LUsPIyENboNbx6SXizgLE";

// Create a custom storage object that encrypts sensitive data
const customStorage = {
  getItem: (key: string) => {
    const value = localStorage.getItem(key);
    // Only try to decrypt if the value exists
    if (value) {
      try {
        // Simple obfuscation (not true encryption, but better than plain text)
        return atob(value);
      } catch (error) {
        // If decoding fails, return the original value
        return value;
      }
    }
    return null;
  },
  setItem: (key: string, value: string) => {
    // Simple obfuscation (not true encryption, but better than plain text)
    localStorage.setItem(key, btoa(value));
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Utility function to check if a session has been invalidated
export const isSessionInvalidated = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error || !data.session) {
      console.info("Session check: No valid session found");
      return true;
    }
    
    return false;
  } catch (err) {
    console.error("Error checking session validity:", err);
    return true; // Assume session is invalid if an error occurs
  }
};
