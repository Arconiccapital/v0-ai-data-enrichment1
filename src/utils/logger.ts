/**
 * Logger utility for consistent logging across the application
 */

import { env } from '@/src/config/env'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: Date
  data?: any
  context?: string
}

class Logger {
  private context: string

  constructor(context: string = 'App') {
    this.context = context
  }

  private log(level: LogLevel, message: string, data?: any) {
    if (env.IS_PRODUCTION && level === 'debug') {
      return // Skip debug logs in production
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context: this.context,
    }

    const formattedMessage = `[${this.context}] ${message}`

    switch (level) {
      case 'debug':
        if (env.NEXT_PUBLIC_ENABLE_DEBUG) {
          console.debug(formattedMessage, data || '')
        }
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '')
        // In production, you might want to send errors to a service like Sentry
        if (env.IS_PRODUCTION) {
          this.reportError(entry)
        }
        break
    }
  }

  private reportError(entry: LogEntry) {
    // Error reporting would be implemented here in production
    // For now, errors are logged to console only
    if (typeof window !== 'undefined') {
      // Could integrate with services like Sentry, LogRocket, etc.
      console.error('[Logger]', entry.message, entry.data)
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any) {
    this.log('error', message, error)
  }

  // Create a child logger with additional context
  child(childContext: string): Logger {
    return new Logger(`${this.context}:${childContext}`)
  }

  // Measure performance
  time(label: string) {
    if (env.NEXT_PUBLIC_ENABLE_DEBUG) {
      console.time(`[${this.context}] ${label}`)
    }
  }

  timeEnd(label: string) {
    if (env.NEXT_PUBLIC_ENABLE_DEBUG) {
      console.timeEnd(`[${this.context}] ${label}`)
    }
  }
}

// Export singleton logger instances for common contexts
export const logger = new Logger()
export const apiLogger = new Logger('API')
export const uiLogger = new Logger('UI')
export const storeLogger = new Logger('Store')

// Export Logger class for creating custom loggers
export { Logger }