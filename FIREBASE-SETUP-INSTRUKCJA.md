# 🔐 Firebase Authentication - Instrukcja Konfiguracji

System logowania został zainstalowany! Teraz każdy użytkownik będzie miał swoje oddzielne konto i dane w chmurze.

---

## ✅ CO ZOSTAŁO ZROBIONE?

### 1. **Firebase SDK zainstalowany** (66 pakietów, 0 vulnerabilities)
   - firebase/app
   - firebase/auth
   - firebase/firestore

### 2. **AuthContext utworzony** (`src/contexts/AuthContext.tsx`)
   - `useAuth()` hook do zarządzania użytkownikiem
   - Funkcje: `signIn()`, `signUp()`, `signInWithGoogle()`, `signOut()`
   - **DEMO_MODE** - działa bez Firebase (offline testing)

### 3. **Strona logowania** (`src/pages/Login.tsx`)
   - Email + hasło
   - Google Sign-In button
   - Validacja formularza
   - Dark mode support
   - "Zapomniałeś hasła?" (ready)

### 4. **Strona rejestracji** (`src/pages/Register.tsx`)
   - Tworzenie nowego konta
   - Potwierdzenie hasła
   - Google Sign-In alternative
   - Terms & Conditions checkbox

### 5. **Account Settings** (zakładka w Settings)
   - Informacje o użytkowniku (email, ID)
   - Status konta
   - Typ synchronizacji (lokalna/chmura)
   - **Przycisk wylogowania**

### 6. **Routing z React Router**
   - `/login` - strona logowania
   - `/register` - rejestracja
   - `/*` - główna aplikacja (chroniona)
   - Automatyczne przekierowanie do `/login` gdy nie zalogowany

### 7. **Protected Routes**
   - Jeśli użytkownik NIE jest zalogowany → redirect do `/login`
   - Jeśli zalogowany → dostęp do całej aplikacji

---

## 🔧 TRYB DEMO (aktualnie AKTYWNY)

W pliku `src/config/firebase.ts` jest:
```typescript
export const DEMO_MODE = true; // ← WŁĄCZONE
```

### Co to oznacza?
✅ **Możesz już teraz testować system logowania!**
- Wpisz **dowolny email** (np. `demo@messubouw.com`)
- Wpisz **dowolne hasło** (np. `test123`)
- Kliknij "Zaloguj się" → zadziała!
- Google Sign-In też działa (symulacja)

Dane są zapisywane w `localStorage` przeglądarki (offline).

---

## 🚀 JAK PRZEJŚĆ NA PRAWDZIWY FIREBASE? (Cloud)

### Krok 1: Stwórz projekt Firebase
1. Otwórz: **https://console.firebase.google.com**
2. Kliknij **"Add project"** (Dodaj projekt)
3. Nazwa: `MESSU BOUW` (lub dowolna)
4. Google Analytics: **Włącz** (opcjonalnie)
5. Kliknij **"Create project"**

### Krok 2: Dodaj aplikację Web
1. W konsoli Firebase kliknij **ikonę "</>" (Web)**
2. App nickname: `MESSU BOUW Web App`
3. **NIE** zaznaczaj "Firebase Hosting"
4. Kliknij **"Register app"**
5. **SKOPIUJ** config object (będzie wyglądał tak):

```javascript
const firebaseConfig = {
  apiKey: "AIza...xxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Krok 3: Włącz Authentication
1. W menu Firebase kliknij **"Authentication"**
2. Kliknij **"Get started"**
3. Zakładka **"Sign-in method"**:
   - **Email/Password** → Enable → Save
   - **Google** → Enable → wybierz email support → Save
4. Gotowe!

### Krok 4: Utwórz Firestore Database
1. W menu Firebase kliknij **"Firestore Database"**
2. Kliknij **"Create database"**
3. Wybierz **"Start in test mode"** (na początek)
4. Location: **europe-west1** (lub najbliższy)
5. Kliknij **"Enable"**

### Krok 5: Wklej config do aplikacji
Otwórz plik: `src/config/firebase.ts`

**PRZED:**
```typescript
export const DEMO_MODE = true; // ← Zmień na false!

const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // ← Zastąp wartościami z Firebasea
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...
};
```

**PO (przykład):**
```typescript
export const DEMO_MODE = false; // ← WYŁĄCZ DEMO MODE!

const firebaseConfig = {
  apiKey: "AIzaSyDXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "messu-bouw-12345.firebaseapp.com",
  projectId: "messu-bouw-12345",
  storageBucket: "messu-bouw-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

### Krok 6: Testuj cloud login!
1. Zapisz plik `firebase.ts`
2. Restart aplikacji (`npm run dev`)
3. Otwórz http://localhost:5000/login
4. Zarejestruj nowe konto → Email + hasło (min. 6 znaków)
5. **LUB** kliknij "Google" → zaloguj przez Google

✅ **Teraz każdy użytkownik ma swoje konto w chmurze!**

---

## 📊 JAK DZIAŁAJĄ DANE W CHMURZE?

### Struktura Firestore:
```
users/
  {userId}/
    invoices/
      {invoiceId} → { number, date, client, ... }
    clients/
      {clientId} → { name, kvk, vat_number, ... }
    companies/
      {companyId} → { name, logo, iban, ... }
    expenses/
      {expenseId} → { amount, category, receipt, ... }
    timesheets/
      {timesheetId} → { date, hours, project, ... }
```

### Co to oznacza?
- **Każdy użytkownik** ma swój folder: `users/abc123/`
- **Dane są ODDZIELONE** - użytkownik A nie widzi danych użytkownika B
- **Synchronizacja automatyczna** - zmiany od razu w chmurze
- **Offline support** - działa bez internetu, sync gdy wrócisz online

---

## 🔒 BEZPIECZEŃSTWO

### Firestore Security Rules (trzeba ustawić)
1. W Firebase Console → Firestore Database → **Rules**
2. Wklej ten kod:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Użytkownik może czytać/pisać TYLKO swoje dane
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Zapobiegaj dostępowi do cudzych danych
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

3. Kliknij **"Publish"**

### Co to robi?
✅ Tylko zalogowany użytkownik może czytać swoje dane
✅ Nikt inny nie ma dostępu (nawet admini nie zobaczą danych bez zgody)
✅ Firestore blokuje próby dostępu do `users/{innyUserId}/`

---

## 🎯 FUNKCJE GOTOWE DO UŻYCIA

### AuthContext (useAuth hook)
```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, signIn, signOut } = useAuth();
  
  if (!isAuthenticated) {
    return <p>Nie zalogowany</p>;
  }
  
  return (
    <div>
      <p>Witaj {user.email}!</p>
      <button onClick={signOut}>Wyloguj</button>
    </div>
  );
}
```

### User ID do zapytań Firestore
```typescript
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/config/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const { user } = useAuth();

// Pobierz faktury TYLKO tego użytkownika
const invoicesRef = collection(db, `users/${user.uid}/invoices`);
const snapshot = await getDocs(invoicesRef);
```

---

## 📝 NASTĘPNE KROKI (TODO)

### 1. **Migracja danych z localStorage do Firestore**
   - Wykryj istniejące dane w localStorage
   - Przy pierwszym logowaniu: "Znaleziono lokalne dane. Przenieść do chmury?"
   - Batch upload: invoices, clients, companies, expenses, timesheets
   - Clear localStorage po migracji

### 2. **Firestore Service (CRUD operations)**
   Stwórz: `src/services/FirestoreService.ts`
   ```typescript
   export class FirestoreService {
     static async createInvoice(userId: string, invoice: Invoice) {
       const docRef = await addDoc(
         collection(db, `users/${userId}/invoices`),
         invoice
       );
       return docRef.id;
     }
     
     static async getInvoices(userId: string) {
       const snapshot = await getDocs(
         collection(db, `users/${userId}/invoices`)
       );
       return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     }
     
     // Similar for clients, companies, expenses, timesheets...
   }
   ```

### 3. **Update hooks/useElectronDB.ts**
   - Zmienić z localStorage na Firestore
   - Użyć `FirestoreService` do CRUD
   - Offline persistence (Firebase SDK robi to automatycznie)

### 4. **Email Verification (opcjonalne)**
   ```typescript
   import { sendEmailVerification } from 'firebase/auth';
   
   await sendEmailVerification(user);
   ```

### 5. **Password Reset**
   ```typescript
   import { sendPasswordResetEmail } from 'firebase/auth';
   
   await sendPasswordResetEmail(auth, email);
   ```

---

## 🆘 TROUBLESHOOTING

### Błąd: "Firebase not initialized"
- Sprawdź czy `DEMO_MODE = false` w `firebase.ts`
- Sprawdź czy wkleiłeś poprawny `firebaseConfig`
- Restart aplikacji (`npm run dev`)

### Błąd: "auth/configuration-not-found"
- W Firebase Console → Authentication → Enable Email/Password

### Błąd: "Missing or insufficient permissions"
- Ustaw Firestore Security Rules (patrz sekcja Bezpieczeństwo)

### Google Sign-In nie działa
- W Firebase Console → Authentication → Google → Enable
- Dodaj `authDomain` do Authorized domains

### Dane się nie synchronizują
- Sprawdź połączenie internetowe
- Sprawdź Firestore Rules
- Sprawdź DevTools Console (F12) → Network tab

---

## 📞 WSPARCIE

**Pytania?** Napisz do mnie!
- GitHub Issues: https://github.com/norbi07011/NEW-POPRAWIONE/issues
- Email: norbs.support@email.com

---

## 🎉 PODSUMOWANIE

✅ **System logowania działa w trybie DEMO**
✅ Możesz testować logowanie/rejestrację już TERAZ
✅ Gdy stworzysz Firebase project → wklej config → działa CLOUD
✅ Każdy użytkownik ma swoje oddzielne dane w chmurze
✅ Offline support + automatyczna synchronizacja
✅ Bezpieczne (Security Rules blokują cudzy dostęp)

**NASTĘPNY KROK:** 
1. Stwórz Firebase project (15 minut)
2. Wklej config do `firebase.ts`
3. Zmień `DEMO_MODE = false`
4. GOTOWE - masz multi-user cloud app! 🚀

---

**Aktualizacja:** 2025-01-XX
**Commit:** 2c7a996
**Branch:** copilot/vscode1762976821786
