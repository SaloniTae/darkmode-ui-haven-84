
import { useCallback } from "react";
import { createFirebaseService } from "@/lib/firebaseService";
import { PlatformType } from "@/types/database";

export const useFirebaseService = (platform: PlatformType = 'default') => {
  const service = useCallback(() => {
    return createFirebaseService(platform);
  }, [platform]);

  return service();
};
