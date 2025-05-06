// Environment configuration
export const IS_DEVELOPMENT = import.meta.env.MODE === 'development';
export const IS_PRODUCTION = import.meta.env.MODE === 'production';
export const IS_PREVIEW = window.location.port === '4173'; 