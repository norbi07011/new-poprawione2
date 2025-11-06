# 🛡️ System Obsługi Błędów - Dokumentacja

## ✅ Zainstalowane Komponenty

### 1. **react-error-boundary** (npm package)
- Profesjonalna biblioteka do React Error Boundaries
- Automatyczne przechwytywanie błędów renderowania
- Kompatybilna z React 19

### 2. **ErrorFallback.tsx** - Ulepszona strona błędu
**Lokalizacja:** `src/ErrorFallback.tsx`

**Funkcje:**
- ✅ Wykrywanie kategorii błędów (Network, Database, Permission, Timeout, File, OCR, API)
- ✅ Przyjazne komunikaty po polsku z emoji
- ✅ Różne poziomy severity (error, warning, info)
- ✅ Szczegóły techniczne dla deweloperów (tylko dev mode)
- ✅ 3 przyciski akcji:
  - "Spróbuj ponownie" - reset error boundary
  - "Strona główna" - redirect do /
  - "Zgłoś błąd" - logging (tylko dev)
- ✅ Sekcja ze wskazówkami dla użytkownika
- ✅ Gradient background + profesjonalny design

**Kategorie błędów:**
```typescript
Network Error    → 🌐 "Brak połączenia"
Database Error   → 💾 "Problem z bazą danych"
Validation Error → ⚠️ "Nieprawidłowe dane"
Permission Error → 🔒 "Brak uprawnień"
Timeout Error    → ⏱️ "Przekroczono czas oczekiwania"
File Error       → 📁 "Problem z plikiem"
OCR Error        → 🔍 "Błąd rozpoznawania tekstu"
API Error        → 🔌 "Błąd API"
Unknown Error    → ❌ "Wystąpił nieoczekiwany błąd"
```

---

### 3. **errorHandler.ts** - Centralny system obsługi błędów
**Lokalizacja:** `src/lib/errorHandler.ts`

**Funkcje eksportowane:**

#### `handleError(error: unknown): AppError`
Analizuje błąd i zwraca przyjazny komunikat dla użytkownika.

```typescript
const appError = handleError(new Error('Network request failed'));
// {
//   title: 'Brak połączenia',
//   message: 'Nie można połączyć się z serwerem. Sprawdź połączenie internetowe.',
//   severity: 'warning',
//   icon: '🌐',
//   technicalDetails: 'Network request failed'
// }
```

#### `logError(error: unknown, context?: Record<string, unknown>): void`
Loguje błąd do konsoli (dev) i opcjonalnie do serwisu (production).

```typescript
logError(error, {
  action: 'create_invoice',
  invoiceNumber: 'INV-123',
  clientId: 'client_456'
});
```

#### `safeAsync<T>(fn, onError?): Promise<T | null>`
Wrapper dla async funkcji z automatyczną obsługą błędów.

```typescript
const result = await safeAsync(
  async () => await fetchData(),
  (error) => console.log('Błąd:', error.message)
);
```

#### `safeSync<T>(fn, onError?): T | null`
Wrapper dla synchronicznych funkcji z automatyczną obsługą błędów.

```typescript
const result = safeSync(
  () => JSON.parse(data),
  (error) => console.log('Błąd parsowania:', error.message)
);
```

#### `createErrorToast(error: unknown)`
Tworzy obiekt gotowy do użycia z toast notifications.

```typescript
const toastData = createErrorToast(error);
toast(toastData);
```

---

### 4. **useErrorHandler.ts** - Hook React
**Lokalizacja:** `src/hooks/useErrorHandler.ts`

**Używa:** `sonner` (toast library)

**Funkcje:**

#### `showError(error, context?)`
Pokazuje błąd jako toast notification.

```typescript
const { showError } = useErrorHandler();

try {
  await saveData();
} catch (error) {
  showError(error, { action: 'save_data', userId: '123' });
}
```

#### `handleAsync(fn, options?)`
Wrapper dla async funkcji z automatycznym toast.

```typescript
const { handleAsync } = useErrorHandler();

await handleAsync(
  async () => {
    await createExpense(data);
  },
  {
    successMessage: '✅ Wydatek dodany',
    context: { supplier: 'Aldi', amount: 50 },
    onError: (err) => console.log('Błąd:', err)
  }
);
```

#### `handleSync(fn, options?)`
Wrapper dla synchronicznych funkcji z automatycznym toast.

```typescript
const { handleSync } = useErrorHandler();

const result = handleSync(
  () => calculateTotal(items),
  {
    successMessage: '✅ Obliczono sumę',
    onError: (err) => console.log('Błąd obliczeń')
  }
);
```

---

## 📋 Przykłady Użycia

### Przykład 1: Obsługa błędów w formularzu (Expenses.tsx)

```typescript
import { useErrorHandler } from '@/hooks/useErrorHandler';

export default function Expenses() {
  const { handleAsync, showError } = useErrorHandler();

  // Zapisywanie z automatycznym toast
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await handleAsync(
      async () => {
        if (editingExpense) {
          await updateExpense(editingExpense.id, expenseData);
        } else {
          await createExpense(expenseData);
        }
        setShowDialog(false);
        resetForm();
      },
      {
        successMessage: editingExpense 
          ? '✅ Wydatek zaktualizowany' 
          : '✅ Wydatek dodany',
        context: {
          action: 'save_expense',
          supplier: formData.supplier,
          amount: gross,
        },
      }
    );
  };

  // OCR z profesjonalną obsługą błędów
  const handleScanReceipt = async (file: File) => {
    try {
      const result = await scanReceipt(file);
      // ... przetwarzanie
    } catch (error) {
      showError(error, {
        action: 'OCR Scanning',
        fileName: file.name,
        fileSize: file.size,
      });
    }
  };
}
```

### Przykład 2: Usuwanie z potwierdzeniem

```typescript
const handleDelete = async (id: string) => {
  if (!window.confirm('Czy na pewno chcesz usunąć?')) return;
  
  const expense = expenses?.find(e => e.id === id);
  
  await handleAsync(
    async () => {
      await deleteExpense(id);
    },
    {
      successMessage: '🗑️ Wydatek usunięty',
      context: {
        action: 'delete_expense',
        expenseId: id,
        supplier: expense?.supplier,
      },
    }
  );
};
```

### Przykład 3: Walidacja przed zapisem

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Walidacja
  if (!formData.supplier || !formData.amount_net) {
    toast.error('⚠️ Wypełnij wymagane pola: Dostawca i Kwota');
    return;
  }

  const inputAmount = parseFloat(formData.amount_net);
  if (isNaN(inputAmount) || inputAmount <= 0) {
    toast.error('⚠️ Kwota musi być liczbą większą od zera');
    return;
  }

  // Zapis z obsługą błędów
  await handleAsync(/* ... */);
};
```

---

## 🔧 Konfiguracja w main.tsx

```typescript
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from './ErrorFallback.tsx';

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
  </ErrorBoundary>
)
```

---

## 🎯 Korzyści

### Dla Użytkowników:
✅ Przyjazne komunikaty błędów po polsku  
✅ Emoji wizualnie wskazują typ problemu  
✅ Konkretne instrukcje co zrobić  
✅ Możliwość recovery bez utraty danych  
✅ Wskazówki rozwiązania problemu  

### Dla Deweloperów:
✅ Szczegółowe logi techniczne (tylko dev mode)  
✅ Context tracking (userId, action, params)  
✅ Stack traces dla debugowania  
✅ Gotowość do integracji z Sentry/LogRocket  
✅ Kategorizacja błędów  
✅ TypeScript type safety  

### Dla Biznesu:
✅ Mniejsza liczba ticket supportowych  
✅ Lepsza retencja użytkowników  
✅ Monitoring błędów w produkcji (ready)  
✅ Profesjonalny wizerunek aplikacji  

---

## 🚀 Gotowość do Produkcji

### ✅ Zrealizowane:
- [x] React Error Boundary z react-error-boundary
- [x] Kategorizacja błędów (9 kategorii)
- [x] Przyjazne komunikaty po polsku
- [x] Toast notifications (sonner)
- [x] Context logging
- [x] Dev/Production mode detection
- [x] Recovery actions (retry, home, report)
- [x] TypeScript type safety
- [x] Hook do łatwego użycia

### 🔜 Opcjonalne Rozszerzenia:
- [ ] Integracja z Sentry/LogRocket (wystarczy odkomentować w errorHandler.ts)
- [ ] Email notifications dla critical errors
- [ ] Analytics tracking błędów
- [ ] Offline queue dla retry mechanizmu
- [ ] Custom retry strategies per error type

---

## 📊 Statystyki

**Pliki dodane:** 3  
**Pliki zmodyfikowane:** 2 (Expenses.tsx, main.tsx)  
**Linie kodu:** ~600  
**Zależności:** react-error-boundary, sonner  
**Pokrycie błędów:** 9 kategorii  
**Języki komunikatów:** Polski  
**TypeScript:** 100%  

---

## 🛠️ Maintenance

### Dodawanie nowej kategorii błędu:

1. W `errorHandler.ts` dodaj nową kategorię do `ErrorCategory` enum
2. W funkcji `handleError()` dodaj `if` statement z detekcją błędu
3. Zwróć obiekt `AppError` z odpowiednimi komunikatami

```typescript
if (message.includes('your_error_keyword')) {
  return {
    title: 'Tytuł błędu',
    message: 'Przyjazny komunikat dla użytkownika',
    severity: 'error',
    icon: '🔴',
    technicalDetails: err.message
  };
}
```

### Zmiana serwisu logowania:

W `errorHandler.ts`, w funkcji `logError()`:

```typescript
if (import.meta.env.PROD) {
  // Odkomentuj i skonfiguruj:
  Sentry.captureException(error, { contexts: { appError: errorLog } });
  // lub
  LogRocket.captureException(error);
}
```

---

**Data utworzenia:** 6 listopada 2025  
**Wersja:** 1.0.0  
**Status:** ✅ Production Ready
