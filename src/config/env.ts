/**
 * Environment configuration
 * Centralizes all environment variables with type safety
 */

const getEnvVar = (key: string, defaultValue?: string): string => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env[key] || defaultValue || ''
  }
  // Client-side (Next.js public env vars)
  return (process.env[key] || defaultValue || '')
}

export const env = {
  // API Keys (server-only)
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  LINKUP_API_KEY: getEnvVar('LINKUP_API_KEY'),
  
  // Public environment variables
  NEXT_PUBLIC_APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  NEXT_PUBLIC_API_URL: getEnvVar('NEXT_PUBLIC_API_URL', '/api'),
  
  // Feature flags
  NEXT_PUBLIC_ENABLE_ANALYTICS: getEnvVar('NEXT_PUBLIC_ENABLE_ANALYTICS', 'false') === 'true',
  NEXT_PUBLIC_ENABLE_DEBUG: getEnvVar('NEXT_PUBLIC_ENABLE_DEBUG', 'false') === 'true',
  
  // App configuration
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_PRODUCTION: getEnvVar('NODE_ENV') === 'production',
  IS_DEVELOPMENT: getEnvVar('NODE_ENV') === 'development',
  IS_TEST: getEnvVar('NODE_ENV') === 'test',
} as const

// Type-safe environment variables
export type Env = typeof env