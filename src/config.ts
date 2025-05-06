import logger from './utils/logger';
import { IS_DEVELOPMENT, IS_PREVIEW, IS_PRODUCTION } from './config/env';

// Get the base URL for the current environment
const getBaseUrl = () => {
  // In preview mode, use the backend server directly
  if (IS_PREVIEW) {
    return 'http://localhost:3001';
  }
  // In production, use the current domain
  if (IS_PRODUCTION) {
    return 'https://ssksilks.in';
  }
  // In development, use localhost
  return 'http://localhost:3001';
};

// API Configuration
export const API_BASE_URL = `${getBaseUrl()}/api`;

// Media URLs
export const MEDIA_BASE_URL = getBaseUrl();

// Log configuration only in development
if (IS_DEVELOPMENT) {
  logger.info('Environment Configuration:', {
    mode: import.meta.env.MODE,
    baseUrl: getBaseUrl(),
    apiBaseUrl: API_BASE_URL,
    mediaBaseUrl: MEDIA_BASE_URL
  });
}

// Other configuration constants
export const APP_NAME = 'Saree Store';
export const APP_DESCRIPTION = 'Your one-stop shop for beautiful sarees';

// Re-export environment flags
export { IS_DEVELOPMENT, IS_PREVIEW, IS_PRODUCTION };