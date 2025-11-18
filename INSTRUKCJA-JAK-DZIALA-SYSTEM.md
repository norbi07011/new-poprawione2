# 🎯 JAK DZIAŁA SYSTEM - INSTRUKCJA KROK PO KROKU

## 📊 ARCHITEKTURA SYSTEMU

```
┌─────────────────────────────────────────────────────────┐
│          MESSU BOUW Aplikacja                           │
│          http://localhost:5000                          │
└────────────┬─────────────────────┬──────────────────────┘
             │                     │
             ▼                     ▼
    ┌────────────────┐    ┌──────────────────┐
    │  🔥 Firebase   │    │  🗄️ Supabase     │
    │  AUTH TYLKO    │    │  BAZA DANYCH     │
    └────────────────┘    └──────────────────┘
         │                      │
         ▼                      ▼
    ✅ Logowanie          ✅ Faktury
    ✅ Rejestracja        ✅ Klienci  
    ✅ Google Auth        ✅ Firmy
    ✅ Reset hasła        ✅ Wydatki
                          ✅ Grafiki pracy
```

---

## 🚀 FLOW UŻYTKOWNIKA - KROK PO KROKU

### **KROK 1: Uruchom aplikację**
```bash
npm run dev
```
Aplikacja startuje na: **http://localhost:5000**

---

### **KROK 2: Pierwsze uruchomienie - Ekran logowania**

#### Co widzisz:
```
┌───────────────────────────────────┐
│      🏗️ MESSU BOUW               │
│                                   │
│   Email:    [____________]        │
│   Hasło:    [____________]        │
│                                   │
│   [  Zaloguj się  ]               │
│   [  Zaloguj przez Google  ]      │
│                                   │
│   Nie masz konta? Zarejestruj się │
└───────────────────────────────────┘
```

#### Co się dzieje w tle:
1. `AuthContext.tsx` sprawdza czy masz aktywną sesję w **Supabase**
2. Jeśli NIE → zostaniesz na `/login`
3. Jeśli TAK → przekierowanie do `/` (główna aplikacja)

#### Kod odpowiedzialny:
```typescript
// src/contexts/AuthContext.tsx
supabase.auth.getSession().then(({ data: { session } }) => {
  setUser(convertUser(session?.user || null));
});
```

---

### **KROK 3A: Rejestracja nowego użytkownika**

#### Kliknij "Zarejestruj się"

Zobaczysz formularz:
```
┌───────────────────────────────────┐
│   📝 Utwórz konto                 │
│                                   │
│   Email:    [____________]        │
│   Hasło:    [____________]        │
│   Potwierdź:[____________]        │
│                                   │
│   ☑ Akceptuję regulamin          │
│                                   │
│   [  Zarejestruj  ]               │
└───────────────────────────────────┘
```

#### Wpisz dane (przykład):
- **Email:** `norbert@messubouw.com`
- **Hasło:** `MojeHaslo123!`
- **Potwierdź hasło:** `MojeHaslo123!`
- ✅ Zaznacz regulamin

#### Kliknij "Zarejestruj"

#### Co się dzieje:
1. **Firebase** tworzy konto w chmurze
2. Firebase wysyła **email weryfikacyjny**
3. Dostajesz powiadomienie:
```
✅ Konto utworzone!

📧 Sprawdź swoją skrzynkę pocztową i kliknij w link aktywacyjny.
⏰ Link ważny przez 24 godziny.

💡 Nie widzisz emaila? Sprawdź folder SPAM.
```

#### Kod odpowiedzialny:
```typescript
// src/contexts/AuthContext.tsx
const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });
  // Firebase wysyła email automatycznie!
};
```

#### 📧 Sprawdź swoją skrzynkę email:
```
Od: Supabase <noreply@supabase.io>
Temat: Potwierdź swój email - MESSU BOUW

Witaj!

Kliknij poniższy link aby aktywować konto:
https://ayinverqjntywglsdlzo.supabase.co/auth/v1/verify?...

Pozdrawiam,
MESSU BOUW
```

#### Kliknij link → Konto aktywne! ✅

---

### **KROK 3B: Logowanie (opcja email)**

Wróć do ekranu logowania:

#### Wpisz dane:
- **Email:** `norbert@messubouw.com`
- **Hasło:** `MojeHaslo123!`

#### Kliknij "Zaloguj się"

#### Co się dzieje:
1. **Supabase** weryfikuje hasło
2. Jeśli OK → dostajesz **token sesji** (zapisany w przeglądarce)
3. `AuthContext` ustawia `user = { uid, email, displayName }`
4. **Automatyczne przekierowanie** do głównej aplikacji `/`

#### Kod odpowiedzialny:
```typescript
// src/contexts/AuthContext.tsx
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  // Token zapisany w localStorage automatycznie!
};
```

---

### **KROK 3C: Logowanie przez Google (szybsze!)**

#### Kliknij "Zaloguj przez Google"

#### Co się dzieje:
1. Otwiera się okno Google
2. Wybierasz swoje konto Google (np. `norbert@gmail.com`)
3. Google potwierdza Twoją tożsamość
4. **Supabase automatycznie** tworzy konto (jeśli pierwsze logowanie)
5. Dostajesz token sesji
6. Przekierowanie do aplikacji `/`

#### Kod odpowiedzialny:
```typescript
// src/contexts/AuthContext.tsx
const signInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
};
```

✅ **Zalogowany!** Teraz możesz korzystać z aplikacji!

---

## 🎯 KROK 4: Jesteś w aplikacji - Jak działają dane?

### Scenariusz: Dodajesz nową fakturę

#### W interfejsie klikasz:
```
Menu → Faktury → Dodaj nową fakturę
```

#### Wypełniasz formularz:
```
Numer: INV-2025-001
Data: 18.11.2025
Klient: Jan Kowalski
Kwota: €1500
```

#### Klikasz "Zapisz"

### Co się dzieje krok po kroku:

#### **1. Pobieramy ID użytkownika z AuthContext**
```typescript
// src/hooks/useElectronDB.ts
const { user } = useAuth(); // user.uid = "abc123xyz"
```

#### **2. Wysyłamy dane do Supabase**
```typescript
// src/services/SupabaseService.ts
await supabase
  .from('invoices')
  .insert({
    user_id: user.uid,  // ← Twoje ID!
    number: 'INV-2025-001',
    date: '2025-11-18',
    client_name: 'Jan Kowalski',
    total: 1500
  });
```

#### **3. Supabase zapisuje w bazie PostgreSQL**
```sql
-- W tabeli invoices:
INSERT INTO invoices (
  id, user_id, number, date, client_name, total
) VALUES (
  'uuid-faktura-1',
  'abc123xyz',  -- Twoje user.uid!
  'INV-2025-001',
  '2025-11-18',
  'Jan Kowalski',
  1500
);
```

#### **4. Aplikacja odświeża listę faktur**
```typescript
// useElectronDB automatycznie pobiera na nowo:
const invoices = await SupabaseService.getUserInvoices(user.uid);
// Widzisz swoją nową fakturę na liście!
```

---

## 🔒 BEZPIECZEŃSTWO - Jak to chroni Twoje dane?

### **Row Level Security (RLS) w Supabase**

Każda tabela ma politykę bezpieczeństwa:

```sql
-- Tylko Ty widzisz swoje faktury!
CREATE POLICY "Users can only see their own invoices"
ON invoices
FOR SELECT
USING (auth.uid() = user_id);

-- Tylko Ty możesz edytować swoje faktury!
CREATE POLICY "Users can only update their own invoices"
ON invoices
FOR UPDATE
USING (auth.uid() = user_id);
```

#### Co to oznacza?
- ❌ Użytkownik A **NIE MOŻE** zobaczyć faktur użytkownika B
- ❌ Użytkownik A **NIE MOŻE** edytować danych użytkownika B
- ✅ Każdy widzi **TYLKO SWOJE** dane

#### Test bezpieczeństwa:
```typescript
// Nawet jeśli spróbujesz hakować:
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', 'CUDZY-USER-ID'); // ← To NIE ZADZIAŁA!

// Supabase zwróci: []
// Bo RLS blokuje dostęp!
```

---

## 📊 GDZIE SĄ ZAPISANE DANE?

### **Przed zalogowaniem:**
```
localStorage przeglądarki
├─ messubouw_invoices: []
├─ messubouw_clients: []
└─ messubouw_company: {}
```
➡️ Dane **lokalne**, znikają po wyczyszczeniu przeglądarki

### **Po zalogowaniu:**
```
Supabase Cloud (PostgreSQL)
├─ invoices
│   ├─ user_id = "abc123" → 15 faktur
│   └─ user_id = "xyz789" → 8 faktur
├─ clients  
│   ├─ user_id = "abc123" → 10 klientów
│   └─ user_id = "xyz789" → 5 klientów
└─ companies
    ├─ user_id = "abc123" → Firma A
    └─ user_id = "xyz789" → Firma B
```
➡️ Dane **w chmurze**, dostępne z każdego urządzenia!

---

## 🔄 SYNCHRONIZACJA - Jak to działa?

### **Scenariusz: Logujesz się z telefonu i komputera**

#### **Na komputerze:**
1. Logujesz się: `norbert@messubouw.com`
2. Dodajesz fakturę INV-001
3. Supabase zapisuje: `user_id = "abc123"`

#### **Na telefonie (5 minut później):**
1. Logujesz się: `norbert@messubouw.com`  
   (To samo konto → `user_id = "abc123"`)
2. Aplikacja pobiera faktury z Supabase:
   ```typescript
   const invoices = await SupabaseService.getUserInvoices("abc123");
   ```
3. **Widzisz fakturę INV-001!** ✅

#### Kod odpowiedzialny:
```typescript
// src/hooks/useElectronDB.ts
useEffect(() => {
  if (user) {
    // Jeśli zalogowany → pobierz z Supabase
    SupabaseService.getUserInvoices(user.uid).then(setData);
  } else {
    // Jeśli nie zalogowany → pobierz z localStorage
    getStorageItem(key).then(setData);
  }
}, [user]);
```

---

## 🛠️ TESTOWANIE SYSTEMU - Krok po kroku

### **Test 1: Rejestracja nowego użytkownika**
```bash
1. Otwórz: http://localhost:5000/login
2. Kliknij: "Zarejestruj się"
3. Email: test@messubouw.com
4. Hasło: Test123!
5. Kliknij: "Zarejestruj"
6. ✅ Sprawdź email (skrzynka odbiorcza)
7. Kliknij link weryfikacyjny
8. ✅ Konto aktywne!
```

### **Test 2: Logowanie przez email**
```bash
1. Wróć do: http://localhost:5000/login
2. Email: test@messubouw.com
3. Hasło: Test123!
4. Kliknij: "Zaloguj się"
5. ✅ Jesteś w aplikacji!
```

### **Test 3: Dodaj fakturę**
```bash
1. Menu → Faktury
2. Kliknij: "+ Nowa faktura"
3. Wypełnij dane
4. Zapisz
5. ✅ Faktura widoczna na liście!
```

### **Test 4: Sprawdź dane w Supabase Dashboard**
```bash
1. Otwórz: https://supabase.com/dashboard
2. Projekt: ayinverqjntywglsdlzo
3. Kliknij: "Table Editor" → "invoices"
4. ✅ Widzisz swoją fakturę!
   - user_id: Twoje ID
   - number: INV-2025-001
   - total: 1500
```

### **Test 5: Multi-device sync**
```bash
1. Na komputerze: Dodaj klienta "ABC Company"
2. Na telefonie: Zaloguj się tym samym kontem
3. Otwórz listę klientów
4. ✅ Widzisz "ABC Company"!
```

### **Test 6: Bezpieczeństwo**
```bash
1. Zaloguj się jako: user1@test.com
2. Dodaj fakturę INV-001
3. Wyloguj się
4. Zaloguj się jako: user2@test.com
5. ✅ NIE widzisz faktury INV-001 (należy do user1!)
```

---

## 🎓 NAJWAŻNIEJSZE PLIKI - Co robi każdy?

### **1. `src/config/supabase.ts`**
```typescript
// Konfiguracja połączenia z bazą danych Supabase
const supabaseUrl = 'https://ayinverqjntywglsdlzo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```
**Zadanie:** Inicjalizuje klienta Supabase

---

### **2. `src/contexts/AuthContext.tsx`**
```typescript
// Zarządza stanem logowania użytkownika
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  const signIn = async (email, password) => { ... };
  const signUp = async (email, password) => { ... };
  const signOut = async () => { ... };
}
```
**Zadanie:** 
- Logowanie/rejestracja
- Przechowuje info o zalogowanym użytkowniku
- Udostępnia `useAuth()` hook

---

### **3. `src/hooks/useElectronDB.ts`**
```typescript
// Uniwersalny hook do zapisu/odczytu danych
export function useElectronDB(key, defaultValue) {
  const { user } = useAuth();
  
  const saveData = async (value) => {
    if (user) {
      // Zalogowany → zapisz w Supabase
      await SupabaseService.saveData(user.uid, value);
    } else {
      // Nie zalogowany → zapisz w localStorage
      localStorage.setItem(key, JSON.stringify(value));
    }
  };
}
```
**Zadanie:**
- Automatycznie wybiera gdzie zapisać dane
- Zalogowany → Supabase Cloud
- Nie zalogowany → localStorage (offline)

---

### **4. `src/services/SupabaseService.ts`**
```typescript
// Operacje na bazie danych Supabase
export class SupabaseService {
  static async getUserInvoices(userId) {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', userId);
    return data;
  }
  
  static async saveInvoice(userId, invoice) {
    await supabase.from('invoices').insert({
      user_id: userId,
      ...invoice
    });
  }
}
```
**Zadanie:** CRUD operations (Create, Read, Update, Delete)

---

### **5. `src/pages/Login.tsx`**
```typescript
// Strona logowania
export default function Login() {
  const { signIn, signInWithGoogle } = useAuth();
  
  const handleSubmit = async (e) => {
    await signIn(email, password);
    navigate('/'); // Przekieruj do głównej aplikacji
  };
}
```
**Zadanie:** Interfejs logowania

---

### **6. `src/main.tsx`**
```typescript
// Główny plik aplikacji - opakowuje wszystko w AuthProvider
ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={<ProtectedApp />} />
      </Routes>
    </BrowserRouter>
  </AuthProvider>
);
```
**Zadanie:** Uruchamia aplikację z ochroną autentykacji

---

## 🔍 FAQ - Często zadawane pytania

### **Q: Czy muszę mieć internet żeby używać aplikacji?**
A: NIE! Możesz pracować offline:
- Dane zapisują się w localStorage
- Przy następnym logowaniu → sync do Supabase

### **Q: Co się stanie jeśli nie zweryfikuję emaila?**
A: Supabase domyślnie pozwala na logowanie, ale można wymusić weryfikację.

### **Q: Czy mogę zmienić hasło?**
A: TAK! Użyj funkcji "Zapomniałem hasła" na stronie logowania.

### **Q: Jak usunąć konto?**
A: W Settings → Account → "Usuń konto" (trzeba dodać tę funkcję)

### **Q: Czy moje dane są bezpieczne?**
A: TAK!
- Hasła hashowane (bcrypt)
- Połączenie HTTPS (szyfrowane)
- RLS w Supabase (izolacja danych)

### **Q: Ile kosztuje hosting?**
A: **DARMOWY!**
- Supabase Free: 500MB bazy, unlimited API
- Firebase Free: Authentication gratis
- Vercel/Netlify: Hosting gratis

### **Q: Co się stanie jak przekroczę limit?**
A: Supabase wyśle email z ostrzeżeniem. Możesz:
- Upgrade do płatnego planu ($25/mies)
- Przenieść starsze dane do archiwum

---

## 🎯 PODSUMOWANIE

### **Jak to działa w skrócie:**

1. **Rejestracja** → Supabase tworzy konto + wysyła email
2. **Logowanie** → Dostajesz token sesji (zapisany w przeglądarce)
3. **Dodajesz dane** → Wysyłane do Supabase z Twoim `user_id`
4. **Odczyt danych** → Supabase zwraca TYLKO Twoje dane (RLS)
5. **Multi-device** → Logowanie tym samym kontem = te same dane
6. **Bezpieczeństwo** → Nikt inny nie widzi Twoich danych

### **Technologie:**
- 🔥 **Supabase** → Autentykacja (logowanie/rejestracja)
- 🗄️ **Supabase PostgreSQL** → Baza danych (faktury, klienci, etc.)
- ⚡ **React** → Frontend (interfejs użytkownika)
- 🎨 **Tailwind CSS** → Stylowanie
- 📱 **Capacitor** → Aplikacja mobilna (Android/iOS)

### **Następne kroki:**
1. ✅ Przetestuj rejestrację/logowanie
2. ✅ Dodaj przykładowe dane
3. ✅ Sprawdź w Supabase Dashboard
4. ✅ Zaloguj się z innego urządzenia

---

## 📞 POTRZEBUJESZ POMOCY?

**Problem z logowaniem?**
```bash
1. Sprawdź czy email jest zweryfikowany
2. Sprawdź console (F12) w przeglądarce
3. Sprawdź czy masz internet
```

**Problem z zapisem danych?**
```bash
1. Sprawdź czy jesteś zalogowany
2. Console → Network → Zobacz czy request do Supabase przeszedł
3. Supabase Dashboard → Logs → Zobacz błędy
```

**Inne pytania?**
- GitHub Issues: https://github.com/norbi07011/NEW-POPRAWIONE/issues
- Email: support@messubouw.com

---

✅ **GOTOWE! Teraz rozumiesz jak działa cały system!** 🚀
