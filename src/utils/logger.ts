import { IS_DEVELOPMENT } from '../config/env';

// Define log levels
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Create a more sophisticated logger
const logger = {
  debug: (...args: any[]) => {
    if (IS_DEVELOPMENT) {
      console.debug('[DEBUG]:', ...args);
    }
  },
  
  info: (...args: any[]) => {
    if (IS_DEVELOPMENT) {
      console.info('[INFO]:', ...args);
    }
  },
  
  warn: (...args: any[]) => {
    // Always show warnings, but sanitize in production
    if (IS_DEVELOPMENT) {
      console.warn('[WARN]:', ...args);
    } else {
      console.warn('[WARN]:', 'See application logs for details');
    }
  },
  
  error: (...args: any[]) => {
    // Always show errors, but sanitize in production
    if (IS_DEVELOPMENT) {
      console.error('[ERROR]:', ...args);
    } else {
      console.error('[ERROR]:', 'See application logs for details');
    }
  },

  // Helper to sanitize sensitive data
  sanitize: (data: any) => {
    if (!IS_DEVELOPMENT) {
      if (typeof data === 'object' && data !== null) {
        const sanitized = { ...data };
        ['token', 'password', 'secret', 'key', 'auth'].forEach(key => {
          if (key in sanitized) {
            sanitized[key] = '[REDACTED]';
          }
        });
        return sanitized;
      }
    }
    return data;
  }
};

// Override console in production
if (!IS_DEVELOPMENT) {
  // Suppress all console methods except error and warn
  const noop = () => {};
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  // Keep console.warn and console.error for critical issues
}

export default logger; 