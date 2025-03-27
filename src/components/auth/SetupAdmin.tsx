
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Admin credentials for initial setup
const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "admin1234";

export const SetupAdmin = () => {
  useEffect(() => {
    const setupAdmin = async () => {
      try {
        // Try to sign in with admin credentials to see if admin exists
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${ADMIN_USERNAME}@example.com`,
          password: ADMIN_PASSWORD,
        });
        
        if (!error && data.user) {
          // Admin exists and we successfully signed in
          // Sign out immediately since we're just checking
          await supabase.auth.signOut();
          console.log("Admin account already exists");
          return;
        }
        
        // If sign-in fails, create a new admin account
        const { error: signupError } = await supabase.auth.signUp({
          email: `${ADMIN_USERNAME}@example.com`,
          password: ADMIN_PASSWORD,
          options: {
            data: {
              username: ADMIN_USERNAME,
              service: 'crunchyroll',
              isAdmin: true
            }
          }
        });
        
        if (signupError) {
          console.error("Error creating admin:", signupError);
          // Don't show error toast to end users as this is happening on app init
        } else {
          console.log("Admin account created successfully");
        }
      } catch (error) {
        console.error("Setup error:", error);
      }
    };

    setupAdmin();
  }, []);

  return null;
};
