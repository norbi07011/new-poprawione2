import { Alert, AlertTitle, AlertDescription } from "./components/ui/alert";
import { Button } from "./components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback = ({ error, resetErrorBoundary }: ErrorFallbackProps) => {
  // Development mode - rethrow dla lepszego debugowania
  if (import.meta.env.DEV) throw error;

  // Kategorie błędów z przyjaznymi komunikatami
  const getErrorInfo = (error: Error) => {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch')) {
      return {
        title: 'Brak połączenia',
        description: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe i spróbuj ponownie.',
        icon: '🌐',
        severity: 'warning' as const
      };
    }
    
    if (message.includes('database') || message.includes('storage')) {
      return {
        title: 'Problem z bazą danych',
        description: 'Wystąpił błąd podczas zapisywania danych. Twoje zmiany mogą nie zostać zachowane.',
        icon: '💾',
        severity: 'error' as const
      };
    }
    
    if (message.includes('permission') || message.includes('unauthorized')) {
      return {
        title: 'Brak uprawnień',
        description: 'Nie masz uprawnień do wykonania tej operacji. Spróbuj się wylogować i zalogować ponownie.',
        icon: '🔒',
        severity: 'warning' as const
      };
    }
    
    if (message.includes('timeout')) {
      return {
        title: 'Przekroczono czas oczekiwania',
        description: 'Operacja trwała zbyt długo. Sprawdź połączenie internetowe i spróbuj ponownie.',
        icon: '⏱️',
        severity: 'warning' as const
      };
    }
    
    // Domyślny błąd
    return {
      title: 'Wystąpił nieoczekiwany błąd',
      description: 'Aplikacja napotkała problem. Spróbuj odświeżyć stronę lub skontaktuj się z pomocą techniczną.',
      icon: '⚠️',
      severity: 'error' as const
    };
  };

  const errorInfo = getErrorInfo(error);
  const showDetails = import.meta.env.MODE !== 'production';

  const handleGoHome = () => {
    resetErrorBoundary();
    window.location.href = '/';
  };

  const handleReportError = () => {
    // Przygotuj dane do zgłoszenia
    const errorReport = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.error('Error Report:', errorReport);
    
    // Opcjonalnie: wyślij do systemu logowania
    // Tutaj możesz dodać integrację z Sentry, LogRocket, etc.
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Główny alert */}
        <Alert 
          variant={errorInfo.severity === 'error' ? 'destructive' : 'default'} 
          className="mb-6 shadow-lg"
        >
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="text-lg font-semibold flex items-center gap-2">
            <span>{errorInfo.icon}</span>
            {errorInfo.title}
          </AlertTitle>
          <AlertDescription className="mt-2 text-base">
            {errorInfo.description}
          </AlertDescription>
        </Alert>
        
        {/* Szczegóły błędu (tylko w dev/staging) */}
        {showDetails && (
          <div className="bg-white border border-red-200 rounded-lg p-4 mb-6 shadow">
            <div className="flex items-center gap-2 mb-3">
              <Bug className="h-4 w-4 text-red-600" />
              <h3 className="font-semibold text-sm text-red-900">
                Szczegóły techniczne (widoczne tylko dla deweloperów):
              </h3>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Komunikat:</p>
                <pre className="text-xs text-red-700 bg-red-50 p-3 rounded border border-red-200 overflow-auto max-h-24">
                  {error.message}
                </pre>
              </div>
              {error.stack && (
                <div>
                  <p className="text-xs font-medium text-gray-600 mb-1">Stack trace:</p>
                  <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded border overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Przyciski akcji */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            onClick={resetErrorBoundary} 
            className="flex-1 shadow"
            size="lg"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Spróbuj ponownie
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline" 
            className="flex-1 shadow"
            size="lg"
          >
            <Home className="mr-2 h-4 w-4" />
            Strona główna
          </Button>
          
          {showDetails && (
            <Button 
              onClick={handleReportError}
              variant="secondary" 
              className="sm:w-auto shadow"
              size="lg"
            >
              <Bug className="mr-2 h-4 w-4" />
              Zgłoś błąd
            </Button>
          )}
        </div>

        {/* Dodatkowe wskazówki */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">💡 Wskazówki:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Odśwież stronę (F5) lub wyczyść cache (Ctrl+F5)</li>
            <li>Sprawdź połączenie internetowe</li>
            <li>Jeśli problem się powtarza, skontaktuj się z pomocą techniczną</li>
            <li>Zapisz swoje dane przed ponowną próbą</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
