
import { netflixConfig } from '@/config/netflixConfig';
import { primeConfig } from '@/config/primeConfig';

export const getServiceConfig = (service: string) => {
  switch (service.toLowerCase()) {
    case 'netflix':
      return netflixConfig;
    case 'prime':
      return primeConfig;
    default:
      throw new Error(`Service configuration not found for: ${service}`);
  }
};
