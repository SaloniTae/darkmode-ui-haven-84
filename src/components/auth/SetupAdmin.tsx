
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
        // Check if admin exists by trying to sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${ADMIN_USERNAME}@example.com`,
          password: ADMIN_PASSWORD,
        });
        
        if (!error && data.user) {
          // Admin exists and we successfully signed in
          // Sign out immediately
          await supabase.auth.signOut();
          return;
        }
        
        // If we get here, admin doesn't exist or we couldn't sign in
        // Create the admin user
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
        } else {
          console.log("Admin account created successfully");
          toast.success("Admin account created successfully");
        }
      } catch (error) {
        console.error("Setup error:", error);
      }
    };

    setupAdmin();
  }, []);

  return null;
};
