/**
 * Centralny system obsługi błędów dla aplikacji MESSU BOUW
 * Zapewnia spójne komunikaty i logowanie błędów
 */

export interface AppError {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  icon: string;
  technicalDetails?: string;
}

/**
 * Kategorie błędów aplikacji
 */
export enum ErrorCategory {
  NETWORK = 'NETWORK',
  DATABASE = 'DATABASE',
  VALIDATION = 'VALIDATION',
  PERMISSION = 'PERMISSION',
  TIMEOUT = 'TIMEOUT',
  FILE = 'FILE',
  OCR = 'OCR',
  API = 'API',
  UNKNOWN = 'UNKNOWN'
}

/**
 * Analizuje błąd i zwraca przyjazny komunikat dla użytkownika
 */
export function handleError(error: unknown): AppError {
  // Jeśli to już AppError, zwróć bez zmian
  if (isAppError(error)) {
    return error;
  }

  // Konwersja na Error object
  const err = error instanceof Error ? error : new Error(String(error));
  const message = err.message.toLowerCase();

  // Kategoryzacja błędu
  if (message.includes('network') || message.includes('fetch failed')) {
    return {
      title: 'Brak połączenia',
      message: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.',
      severity: 'warning',
      icon: '🌐',
      technicalDetails: err.message
    };
  }

  if (message.includes('database') || message.includes('storage') || message.includes('indexeddb')) {
    return {
      title: 'Problem z bazą danych',
      message: 'Wystąpił błąd podczas zapisywania danych. Spróbuj ponownie.',
      severity: 'error',
      icon: '💾',
      technicalDetails: err.message
    };
  }

  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return {
      title: 'Nieprawidłowe dane',
      message: 'Wprowadzone dane są nieprawidłowe. Sprawdź formularz i popraw błędy.',
      severity: 'warning',
      icon: '⚠️',
      technicalDetails: err.message
    };
  }

  if (message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden')) {
    return {
      title: 'Brak uprawnień',
      message: 'Nie masz uprawnień do wykonania tej operacji.',
      severity: 'warning',
      icon: '🔒',
      technicalDetails: err.message
    };
  }

  if (message.includes('timeout') || message.includes('timed out')) {
    return {
      title: 'Przekroczono czas oczekiwania',
      message: 'Operacja trwała zbyt długo. Spróbuj ponownie.',
      severity: 'warning',
      icon: '⏱️',
      technicalDetails: err.message
    };
  }

  if (message.includes('file') || message.includes('upload') || message.includes('download')) {
    return {
      title: 'Problem z plikiem',
      message: 'Nie można przetworzyć pliku. Sprawdź czy plik jest prawidłowy.',
      severity: 'error',
      icon: '📁',
      technicalDetails: err.message
    };
  }

  if (message.includes('ocr') || message.includes('tesseract')) {
    return {
      title: 'Błąd rozpoznawania tekstu',
      message: 'Nie można odczytać tekstu z obrazu. Spróbuj lepszego zdjęcia.',
      severity: 'warning',
      icon: '🔍',
      technicalDetails: err.message
    };
  }

  if (message.includes('api') || message.includes('kvk')) {
    return {
      title: 'Błąd API',
      message: 'Nie można pobrać danych z zewnętrznego serwisu. Spróbuj później.',
      severity: 'error',
      icon: '🔌',
      technicalDetails: err.message
    };
  }

  // Domyślny błąd
  return {
    title: 'Wystąpił nieoczekiwany błąd',
    message: 'Coś poszło nie tak. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    severity: 'error',
    icon: '❌',
    technicalDetails: err.message
  };
}

/**
 * Sprawdza czy obiekt jest AppError
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'title' in error &&
    'message' in error &&
    'severity' in error &&
    'icon' in error
  );
}

/**
 * Loguje błąd do konsoli (w dev) i opcjonalnie do serwisu logowania
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const appError = handleError(error);
  
  const errorLog = {
    ...appError,
    context,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    stack: error instanceof Error ? error.stack : undefined
  };

  // Console log w development
  if (import.meta.env.DEV) {
    console.error('🔴 Application Error:', errorLog);
  }

  // TODO: Wysyłanie do serwisu logowania (Sentry, LogRocket, etc.)
  // przykład:
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { contexts: { appError: errorLog } });
  // }
}

/**
 * Wrapper dla async funkcji z automatyczną obsługą błędów
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  onError?: (error: AppError) => void
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = handleError(error);
    logError(error);
    onError?.(appError);
    return null;
  }
}

/**
 * Wrapper dla synchronicznych funkcji z automatyczną obsługą błędów
 */
export function safeSync<T>(
  fn: () => T,
  onError?: (error: AppError) => void
): T | null {
  try {
    return fn();
  } catch (error) {
    const appError = handleError(error);
    logError(error);
    onError?.(appError);
    return null;
  }
}

/**
 * Hook-friendly toast error handler
 */
export function createErrorToast(error: unknown) {
  const appError = handleError(error);
  return {
    title: `${appError.icon} ${appError.title}`,
    description: appError.message,
    variant: appError.severity === 'error' ? 'destructive' : 'default'
  };
}
