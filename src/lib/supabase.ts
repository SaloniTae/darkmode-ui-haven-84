
import { createClient } from "@supabase/supabase-js";

// Use environment variables when available, fallback to hardcoded for development
const supabaseUrl = "https://rqtncenvanahxthockwn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxdG5jZW52YW5haHh0aG9ja3duIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNjEyMzMsImV4cCI6MjA1ODYzNzIzM30.QcAlzMuhNUAEzZnmuQZyJ_LUsPIyENboNbx6SXizgLE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
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
