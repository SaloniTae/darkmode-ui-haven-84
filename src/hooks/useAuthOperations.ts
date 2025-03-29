
import { User } from "@supabase/supabase-js";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ServiceType } from "@/types/auth";
import { useNavigate } from "react-router-dom";

export const useAuthOperations = () => {
  const navigate = useNavigate();
  const [pendingUsernameChange, setPendingUsernameChange] = useState<string | null>(null);

  const login = async (username: string, password: string, service: ServiceType) => {
    try {
      const email = username.includes('@') ? username : `${username}@gmail.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user?.user_metadata?.service !== service) {
        await supabase.auth.signOut();
        toast.error(`You are not authorized to access the ${service} dashboard`);
        return;
      }

      toast.success(`Logged in to ${service} dashboard successfully!`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    }
  };

  const signup = async (username: string, password: string, token: string, service: ServiceType) => {
    try {
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('service', service)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        toast.error("Invalid or expired token");
        return;
      }

      const email = username.includes('@') ? username : `${username}@gmail.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            service
          }
        }
      });

      if (error) {
        throw error;
      }

      await supabase
        .from('tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      toast.success(`Signed up to ${service} dashboard successfully!`);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to signup");
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  const generateToken = async (service: ServiceType, currentService: ServiceType | null, userId: string | undefined): Promise<string | null> => {
    try {
      if (currentService !== 'crunchyroll') {
        toast.error("Only Crunchyroll admin can generate tokens");
        return null;
      }

      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('tokens')
        .insert([{ 
          token, 
          service,
          used: false,
          created_by: userId || null
        }]);

      if (error) {
        console.error("Token generation error:", error);
        toast.error(`Failed to generate token: ${error.message}`);
        return null;
      }

      toast.success(`Generated token for ${service}`);
      return token;
    } catch (error: any) {
      console.error("Token generation error:", error);
      toast.error(error.message || "Failed to generate token");
      return null;
    }
  };

  const updateUsername = async (newUsername: string): Promise<void> => {
    try {
      const email = newUsername.includes('@') ? newUsername : `${newUsername}@gmail.com`;
      
      // Store the pending username change
      setPendingUsernameChange(newUsername);
      
      // Request email verification before updating the username
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) {
        setPendingUsernameChange(null);
        throw error;
      }

      toast.success("Please check your email to confirm your username change.");
    } catch (error: any) {
      console.error("Update username error:", error);
      toast.error(error.message || "Failed to update username");
    }
  };

  const confirmUsernameChange = async (): Promise<void> => {
    try {
      if (!pendingUsernameChange) return;
      
      const email = pendingUsernameChange.includes('@') ? pendingUsernameChange : `${pendingUsernameChange}@gmail.com`;
      
      // Update user metadata with the new username
      const { error } = await supabase.auth.updateUser({
        data: { username: pendingUsernameChange }
      });

      if (error) {
        throw error;
      }

      toast.success("Username updated successfully");
      setPendingUsernameChange(null);
    } catch (error: any) {
      console.error("Confirm username error:", error);
      toast.error(error.message || "Failed to confirm username change");
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      // Update the password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
      
      // Sign out from all devices after successful password change
      await supabase.auth.signOut({ scope: 'global' });
      
      // Redirect to login page
      navigate('/login');
      
      toast.info("Logged out from all devices for security");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  return {
    login,
    signup,
    logout,
    generateToken,
    updateUsername,
    updatePassword,
    confirmUsernameChange,
    pendingUsernameChange
  };
};
