import { UserRole } from '@prisma/client';

/**
 * Extend Express Request interface to include custom properties
 * used throughout the application
 */
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        userId: string;
        walletAddress: string;
        role: UserRole;
      };
      userId?: string;
    }
  }
}

export {};
