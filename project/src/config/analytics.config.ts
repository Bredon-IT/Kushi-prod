// Analytics Configuration
// Automatically fetches tracking IDs from AWS SSM Parameter Store at runtime
import Global_API_BASE from "../services/GlobalConstants";



interface AnalyticsConfig {
  googleAnalyticsId: string;
  facebookPixelId: string;
  isProduction: boolean;
}

let cachedConfig: AnalyticsConfig | null = null;

// Fetch configuration from backend API (which reads from AWS SSM)
const fetchAnalyticsConfig = async (): Promise<AnalyticsConfig> => {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const apiBase = import.meta.env.VITE_API_BASE_URL || Global_API_BASE;
    const response = await fetch(`${apiBase}/api/config/analytics`);

    if (!response.ok) {
      throw new Error('Failed to fetch analytics config');
    }

    const data = await response.json();
    cachedConfig = {
      googleAnalyticsId: data.googleAnalyticsId || 'G-XXXXXXXXXX',
      facebookPixelId: data.facebookPixelId || '2269293163517834',
      isProduction: import.meta.env.MODE === 'production',
    };

    return cachedConfig;
  } catch (error) {
    console.warn('Failed to fetch analytics config from SSM, using defaults:', error);

    // Fallback to environment variables if SSM fetch fails
    cachedConfig = {
      googleAnalyticsId: import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX',
      facebookPixelId: import.meta.env.VITE_FB_PIXEL_ID || '2269293163517834',
      isProduction: import.meta.env.MODE === 'production',
    };

    return cachedConfig;
  }
};

// Initialize configuration on app load
let configPromise: Promise<AnalyticsConfig> | null = null;

export const initAnalyticsConfig = () => {
  if (!configPromise) {
    configPromise = fetchAnalyticsConfig();
  }
  return configPromise;
};

// Synchronous access to config (must call initAnalyticsConfig first)
export const getAnalyticsConfig = (): AnalyticsConfig => {
  if (!cachedConfig) {
    // Return defaults if not initialized yet
    return {
      googleAnalyticsId: import.meta.env.VITE_GA_TRACKING_ID || 'G-XXXXXXXXXX',
      facebookPixelId: import.meta.env.VITE_FB_PIXEL_ID || '2269293163517834',
      isProduction: import.meta.env.MODE === 'production',
    };
  }
  return cachedConfig;
};

// Export individual values for backward compatibility
export const GA_TRACKING_ID = () => getAnalyticsConfig().googleAnalyticsId;
export const FB_PIXEL_ID = () => getAnalyticsConfig().facebookPixelId;
