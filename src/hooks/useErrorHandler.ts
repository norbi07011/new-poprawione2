/**
 * Hook do obsługi błędów z toast notifications
 */

import { toast } from 'sonner';
import { handleError, logError, type AppError } from '@/lib/errorHandler';

export function useErrorHandler() {
  /**
   * Pokazuje błąd jako toast notification
   */
  const showError = (error: unknown, context?: Record<string, unknown>) => {
    const appError = handleError(error);
    logError(error, context);

    if (appError.severity === 'error') {
      toast.error(`${appError.icon} ${appError.title}`, {
        description: appError.message,
        duration: 6000,
      });
    } else if (appError.severity === 'warning') {
      toast.warning(`${appError.icon} ${appError.title}`, {
        description: appError.message,
        duration: 4000,
      });
    } else {
      toast.info(`${appError.icon} ${appError.title}`, {
        description: appError.message,
        duration: 4000,
      });
    }

    return appError;
  };

  /**
   * Wrapper dla async funkcji z automatycznym toast
   */
  const handleAsync = async <T,>(
    fn: () => Promise<T>,
    options?: {
      successMessage?: string;
      context?: Record<string, unknown>;
      onError?: (error: AppError) => void;
    }
  ): Promise<T | null> => {
    try {
      const result = await fn();
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      const appError = showError(error, options?.context);
      options?.onError?.(appError);
      return null;
    }
  };

  /**
   * Wrapper dla synchronicznych funkcji z automatycznym toast
   */
  const handleSync = <T,>(
    fn: () => T,
    options?: {
      successMessage?: string;
      context?: Record<string, unknown>;
      onError?: (error: AppError) => void;
    }
  ): T | null => {
    try {
      const result = fn();
      
      if (options?.successMessage) {
        toast.success(options.successMessage);
      }
      
      return result;
    } catch (error) {
      const appError = showError(error, options?.context);
      options?.onError?.(appError);
      return null;
    }
  };

  return {
    showError,
    handleAsync,
    handleSync,
  };
}
