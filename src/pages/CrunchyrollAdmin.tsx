
import { useEffect, useState, useRef, useCallback } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { CredentialsPanel } from "@/components/admin/CredentialsPanel";
import { SlotsPanel } from "@/components/admin/SlotsPanel";
import { ReferralsPanel } from "@/components/admin/ReferralsPanel";
import { TransactionsPanel } from "@/components/admin/TransactionsPanel";
import { UIConfigPanel } from "@/components/admin/UIConfigPanel";
import { UsersPanel } from "@/components/admin/UsersPanel";
import { TokenGenerator } from "@/components/admin/TokenGenerator";
import { Loader2 } from "lucide-react";
import { useFirebaseService } from "@/hooks/useFirebaseService";
import { DatabaseSchema, UIConfig } from "@/types/database";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function CrunchyrollAdmin() {
  const [loading, setLoading] = useState(false);
  const [dbData, setDbData] = useState<DatabaseSchema | null>(null);
  const { isAuthenticated } = useAuth();
  const dataFetchedRef = useRef(false);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const firebaseService = useFirebaseService('default'); // Crunchyroll is default

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Initial data load
      const data = await firebaseService.fetchData("/");
      setDbData(data);
      toast.success("Crunchyroll database loaded successfully");
      dataFetchedRef.current = true;
      
      // Set up real-time listener
      unsubscribeRef.current = firebaseService.subscribeToData("/", (realtimeData) => {
        if (realtimeData) {
          setDbData(realtimeData);
        }
      });
    } catch (error) {
      console.error("Error loading Crunchyroll database:", error);
      toast.error("Failed to load Crunchyroll database");
    } finally {
      setLoading(false);
    }
  }, [firebaseService]);

  useEffect(() => {
    // Only fetch data if authenticated and not already fetched
    if (isAuthenticated && !dataFetchedRef.current) {
      loadData();
    }
    
    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [isAuthenticated, loadData]);

  // If not authenticated, don't show anything as the ProtectedRoute component
  // will handle the redirect to login page
  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return <MainLayout className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-medium">Loading Crunchyroll database...</h2>
        </div>
      </MainLayout>;
  }

  if (!dbData) {
    return <MainLayout>
        <div className="glass-morphism p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Database Error</h2>
          <p className="text-red-400">Failed to load Crunchyroll database. Please check your connection and try again.</p>
        </div>
      </MainLayout>;
  }

  // Default UIConfig to handle missing properties
  const defaultUiConfig: UIConfig = {
    approve_flow: {
      account_format: "",
      gif_url: "",
      success_text: ""
    },
    confirmation_flow: {
      button_text: "",
      callback_data: "",
      caption: "",
      gif_url: "",
      photo_url: ""
    },
    crunchyroll_screen: {
      button_text: "",
      callback_data: "",
      caption: "",
      photo_url: ""
    },
    freetrial_info: {
      photo_url: ""
    },
    locked_flow: {
      locked_text: ""
    },
    out_of_stock: {
      gif_url: "",
      messages: []
    },
    phonepe_screen: {
      caption: "",
      followup_text: "",
      photo_url: ""
    },
    referral_info: {
      photo_url: ""
    },
    reject_flow: {
      error_text: "",
      gif_url: ""
    },
    slot_booking: {
      button_format: "",
      callback_data: "",
      caption: "",
      gif_url: "",
      photo_url: ""
    },
    start_command: {
      buttons: [],
      welcome_photo: "",
      welcome_text: ""
    }
  };

  return <MainLayout>
      <div className="space-y-8">
        <Tabs defaultValue="tokens" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-2 md:grid-cols-8 h-auto p-1 glass-morphism shadow-lg">
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="tokens">Tokens</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="admin">Admins</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="credentials">Credentials</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="slots">Slots</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="referrals">Referrals</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="transactions">Transactions</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="uiconfig">UI Config</TabsTrigger>
            <TabsTrigger className="py-2.5 text-sm font-medium transition-all hover:bg-white/10" value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tokens" className="mt-0">
            <TokenGenerator />
          </TabsContent>
          
          <TabsContent value="admin" className="mt-0">
            <AdminPanel adminConfig={dbData?.admin_config || { superior_admins: [], inferior_admins: [] }} />
          </TabsContent>
          
          <TabsContent value="credentials" className="mt-0">
            <CredentialsPanel credentials={{
              cred1: dbData?.cred1 || {
                belongs_to_slot: "",
                email: "",
                password: "",
                expiry_date: "",
                locked: 0,
                max_usage: 0,
                usage_count: 0
              },
              cred2: dbData?.cred2 || {
                belongs_to_slot: "",
                email: "",
                password: "",
                expiry_date: "",
                locked: 0,
                max_usage: 0,
                usage_count: 0
              },
              cred3: dbData?.cred3 || {
                belongs_to_slot: "",
                email: "",
                password: "",
                expiry_date: "",
                locked: 0,
                max_usage: 0,
                usage_count: 0
              },
              cred4: dbData?.cred4 || {
                belongs_to_slot: "",
                email: "",
                password: "",
                expiry_date: "",
                locked: 0,
                max_usage: 0,
                usage_count: 0
              },
              ...Object.fromEntries(
                Object.entries(dbData || {})
                  .filter(([key]) => key.startsWith('cred') && !['cred1', 'cred2', 'cred3', 'cred4'].includes(key))
                  .map(([key, value]) => [key, value])
              )
            }} slots={dbData?.settings?.slots || {}} />
          </TabsContent>
          
          <TabsContent value="slots" className="mt-0">
            <SlotsPanel slots={dbData?.settings?.slots || {}} />
          </TabsContent>
          
          <TabsContent value="referrals" className="mt-0">
            <ReferralsPanel 
              referrals={dbData?.referrals || {}} 
              referralSettings={dbData?.referral_settings || {
                buy_with_points_enabled: false,
                free_trial_enabled: false,
                points_per_referral: 0,
                required_point: 0
              }} 
              freeTrialClaims={dbData?.free_trial_claims || {}} 
            />
          </TabsContent>
          
          <TabsContent value="transactions" className="mt-0">
            <TransactionsPanel transactions={dbData?.transactions || {}} usedOrderIds={dbData?.used_orderids || {}} />
          </TabsContent>
          
          <TabsContent value="uiconfig" className="mt-0">
            <UIConfigPanel uiConfig={dbData?.ui_config || defaultUiConfig} />
          </TabsContent>
          
          <TabsContent value="users" className="mt-0">
            <UsersPanel users={dbData?.users || {}} />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>;
}
