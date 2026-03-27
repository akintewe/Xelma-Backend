import winston from 'winston';

// Augment winston.Logger type to include our custom method
declare global {
  namespace Express {
    interface Logger {
      withRequestId(requestId?: string): winston.Logger;
    }
  }
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

/**
 * Create a child logger with request ID context.
 * Adds requestId to all log entries for that context.
 */
(logger as any).withRequestId = function (requestId?: string): winston.Logger {
  if (!requestId) return this;
  
  return this.child({ requestId });
};

export default logger;
