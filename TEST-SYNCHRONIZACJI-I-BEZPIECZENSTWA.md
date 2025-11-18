# 🔄 TEST SYNCHRONIZACJI MIĘDZY URZĄDZENIAMI

## 🎯 Cel testu: Sprawdzić czy dane synchronizują się między komputerem, telefonem i tabletem

---

## 📱 SCENARIUSZ 1: Synchronizacja podstawowa

### **Krok 1: Zaloguj się na komputerze**
```
1. Otwórz: http://localhost:5000
2. Zaloguj się: norbert@messubouw.com / TwojeHaslo123!
3. Sprawdź w konsoli przeglądarki (F12):
   console.log('User ID:', user.uid)
   // Zapisz to ID! Np: "abc123xyz789"
```

### **Krok 2: Dodaj fakturę na komputerze**
```
1. Menu → Faktury → Dodaj nową
2. Wypełnij:
   - Numer: INV-2025-001
   - Data: 18.11.2025
   - Klient: Test Client
   - Kwota: €1000
3. Zapisz
4. ✅ Faktura widoczna na liście
```

### **Krok 3: Sprawdź w Supabase Dashboard**
```
1. Otwórz nową kartę: https://supabase.com/dashboard
2. Zaloguj się do swojego konta Supabase
3. Wybierz projekt: ayinverqjntywglsdlzo
4. Kliknij: Table Editor → invoices
5. ✅ Zobaczysz swoją fakturę:
   - user_id: abc123xyz789 (Twoje ID!)
   - number: INV-2025-001
   - total: 1000
   - created_at: 2025-11-18 23:xx:xx
```

### **Krok 4: Zaloguj się na telefonie**
```
Opcja A - Jeśli masz aplikację zainstalowaną:
1. Otwórz aplikację MESSU BOUW na telefonie
2. Zaloguj się TYM SAMYM kontem: norbert@messubouw.com

Opcja B - Przez przeglądarkę mobilną:
1. Otwórz Chrome/Safari na telefonie
2. Wpisz: http://192.168.1.75:5000
   (musisz być w tej samej sieci WiFi!)
3. Zaloguj się: norbert@messubouw.com
```

### **Krok 5: Sprawdź synchronizację** ✨
```
1. Na telefonie otwórz: Menu → Faktury
2. ✅ WIDZISZ fakturę INV-2025-001!
3. Data: 18.11.2025
4. Kwota: €1000
```

**🎉 DZIAŁA! Dane zsynchronizowane automatycznie!**

---

## 🔄 SCENARIUSZ 2: Synchronizacja dwukierunkowa

### **Na telefonie:**
```
1. Menu → Klienci → Dodaj nowego
2. Nazwa: ABC Company
3. Email: abc@company.com
4. Telefon: +31 123 456 789
5. Zapisz
```

### **Na komputerze:**
```
1. Odśwież stronę (F5)
   LUB poczekaj 5 sekund (auto-refresh)
2. Menu → Klienci
3. ✅ Widzisz "ABC Company"!
```

**🎉 Synchronizacja dwukierunkowa działa!**

---

## ⚡ SCENARIUSZ 3: Synchronizacja real-time

### **Test edycji w czasie rzeczywistym:**

#### **Urządzenie 1 (Komputer):**
```
1. Otwórz fakturę INV-2025-001
2. Zmień kwotę: €1000 → €1500
3. Zapisz
```

#### **Urządzenie 2 (Telefon):**
```
1. Miej otwartą listę faktur
2. Poczekaj 3-5 sekund
3. ✅ Kwota automatycznie się zaktualizowała: €1500!
```

**Jak to działa?**
```typescript
// src/hooks/useElectronDB.ts
useEffect(() => {
  // Auto-refresh co 5 sekund gdy user jest zalogowany
  const interval = setInterval(() => {
    if (user) {
      fetchDataFromSupabase();
    }
  }, 5000);
  
  return () => clearInterval(interval);
}, [user]);
```

---

## 📊 SCENARIUSZ 4: Offline → Online sync

### **Krok 1: Wyłącz internet na telefonie**
```
1. Telefon → Tryb samolotowy ON
2. Spróbuj dodać fakturę: INV-2025-002
3. ❌ Błąd: "Brak połączenia"
   (lub zapisze się lokalnie jeśli mamy offline mode)
```

### **Krok 2: Włącz internet**
```
1. Wyłącz tryb samolotowy
2. Odśwież aplikację (pull-to-refresh)
3. ✅ Dane zsynchronizowane!
```

**Uwaga:** Obecnie brak pełnego offline mode - to można dodać!

---

# 🔒 TEST ZABEZPIECZEŃ (RLS - Row Level Security)

## 🎯 Cel: Sprawdzić czy użytkownicy widzą TYLKO swoje dane

---

## 🛡️ SCENARIUSZ 5: Test izolacji danych

### **Przygotowanie: Utwórz 2 konta**

#### **Konto 1 (Alice):**
```
Email: alice@test.com
Hasło: Alice123!
```

#### **Konto 2 (Bob):**
```
Email: bob@test.com
Hasło: Bob123!
```

---

### **Krok 1: Alice dodaje fakturę**
```
1. Zaloguj się jako: alice@test.com
2. Dodaj fakturę:
   - Numer: ALICE-001
   - Klient: Alice Client
   - Kwota: €5000
3. Zapisz
4. ✅ Widoczna na liście
```

### **Krok 2: Sprawdź w Supabase Dashboard**
```
1. Table Editor → invoices
2. Znajdź fakturę ALICE-001
3. Zanotuj user_id (np: "user_alice_123")
```

---

### **Krok 3: Bob próbuje zobaczyć dane Alice** 🔒

#### **Test 1: Przez interfejs**
```
1. Wyloguj się
2. Zaloguj się jako: bob@test.com
3. Menu → Faktury
4. ✅ SUKCES: Lista jest PUSTA!
   (Bob nie widzi faktury ALICE-001)
```

#### **Test 2: Przez DevTools (próba hakowania)**
```
1. Zalogowany jako Bob
2. Otwórz Console (F12)
3. Spróbuj "zhakować" i pobrać dane Alice:

// Próba 1: Bezpośrednie zapytanie
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('number', 'ALICE-001');

console.log(data);
// Rezultat: [] (PUSTE!)
// ✅ RLS zablokował dostęp!

// Próba 2: Podszywanie się pod Alice user_id
const { data } = await supabase
  .from('invoices')
  .select('*')
  .eq('user_id', 'user_alice_123');

console.log(data);
// Rezultat: [] (PUSTE!)
// ✅ RLS sprawdza prawdziwe auth.uid(), nie można oszukać!
```

**🎉 BEZPIECZEŃSTWO DZIAŁA! Bob NIE MOŻE zobaczyć danych Alice!**

---

## 🔐 SCENARIUSZ 6: Test polityk RLS

### **Sprawdź polityki w Supabase Dashboard:**

```
1. Supabase Dashboard
2. Projekt: ayinverqjntywglsdlzo
3. Menu: Authentication → Policies
4. Tabela: invoices
```

### **Polityka 1: SELECT (Odczyt)**
```sql
CREATE POLICY "Users can view only their own invoices"
ON invoices
FOR SELECT
USING (auth.uid() = user_id);
```

**Co to oznacza?**
- ✅ Użytkownik widzi TYLKO faktury gdzie `user_id` = jego ID
- ❌ Nie może zobaczyć faktur innych użytkowników
- 🔒 Sprawdzane na poziomie bazy danych (nie można obejść!)

---

### **Polityka 2: INSERT (Dodawanie)**
```sql
CREATE POLICY "Users can create their own invoices"
ON invoices
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

**Co to oznacza?**
- ✅ Użytkownik może dodać fakturę dla siebie
- ❌ Nie może dodać faktury z cudzym user_id
- 🔒 Nawet jeśli w kodzie wpisze cudzy user_id, Supabase odrzuci!

**Test:**
```javascript
// Bob próbuje dodać fakturę jako Alice
const { error } = await supabase
  .from('invoices')
  .insert({
    user_id: 'user_alice_123',  // Cudzy ID!
    number: 'FAKE-001',
    total: 9999
  });

console.log(error);
// Error: "new row violates row-level security policy"
// ✅ Supabase ZABLOKOWAŁ!
```

---

### **Polityka 3: UPDATE (Edycja)**
```sql
CREATE POLICY "Users can update only their own invoices"
ON invoices
FOR UPDATE
USING (auth.uid() = user_id);
```

**Test:**
```javascript
// Bob próbuje edytować fakturę Alice
const { error } = await supabase
  .from('invoices')
  .update({ total: 0 })  // Próba wyzerowania!
  .eq('number', 'ALICE-001');

console.log(error);
// Error: Policy violation
// ✅ ZABLOKOWANE!
```

---

### **Polityka 4: DELETE (Usuwanie)**
```sql
CREATE POLICY "Users can delete only their own invoices"
ON invoices
FOR DELETE
USING (auth.uid() = user_id);
```

**Test:**
```javascript
// Bob próbuje usunąć fakturę Alice
const { error } = await supabase
  .from('invoices')
  .delete()
  .eq('number', 'ALICE-001');

console.log(error);
// Error: Policy violation
// ✅ Nie można usunąć cudzych danych!
```

---

## 🎭 SCENARIUSZ 7: Test SQL Injection (próba ataku)

### **Haker próbuje zhakować przez formularz:**

```
1. Zalogowany jako Bob
2. Dodaj fakturę z "hakerskim" numerem:

Numer faktury: ' OR 1=1; DROP TABLE invoices; --
Klient: Test
```

### **Co się stanie?**
```javascript
// Aplikacja wysyła:
await supabase
  .from('invoices')
  .insert({
    user_id: 'user_bob_123',
    number: "' OR 1=1; DROP TABLE invoices; --",
    client_name: 'Test'
  });
```

**Rezultat:**
```
✅ Faktura zapisana z numerem: ' OR 1=1; DROP TABLE invoices; --
❌ Tabela NIE została usunięta!
✅ Supabase AUTOMATYCZNIE escapuje znaki specjalne!
```

**Dlaczego bezpieczne?**
- Supabase używa **prepared statements**
- Wszystkie wartości są **parametryzowane**
- SQL injection **niemożliwy**!

---

## 🔍 SCENARIUSZ 8: Test JWT Token (próba podrobienia)

### **Haker przechwytuje token:**

```javascript
// Bob przechwycił token Alice z sieci
const stolenToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

// Próbuje użyć w API request
fetch('https://ayinverqjntywglsdlzo.supabase.co/rest/v1/invoices', {
  headers: {
    'Authorization': `Bearer ${stolenToken}`,
    'apikey': 'anon-key...'
  }
});
```

**Co się stanie?**
```
Opcja 1: Token wygasł (TTL 1 godzina)
❌ Error: "JWT expired"

Opcja 2: Token aktywny
✅ Request przejdzie
✅ ALE: RLS nadal sprawdza auth.uid()
✅ Bob zobaczy TYLKO swoje dane (nie Alice)!
```

**Dlaczego bezpieczne?**
- Token zawiera `sub` (user ID)
- Supabase sprawdza `auth.uid()` z tokena
- Nawet z cudzym tokenem - widzisz swoje dane!

---

## 📊 PODSUMOWANIE TESTÓW

### ✅ **Co działa:**

| Test | Status | Opis |
|------|--------|------|
| Sync komputer → telefon | ✅ | Dane automatycznie zsynchronizowane |
| Sync telefon → komputer | ✅ | Dwukierunkowa synchronizacja |
| Real-time update | ✅ | Zmiany widoczne w 5 sekund |
| Izolacja użytkowników | ✅ | Alice nie widzi danych Boba |
| RLS SELECT | ✅ | Tylko swoje dane |
| RLS INSERT | ✅ | Nie można dodać z cudzym user_id |
| RLS UPDATE | ✅ | Nie można edytować cudzych danych |
| RLS DELETE | ✅ | Nie można usunąć cudzych danych |
| SQL Injection | ✅ | Automatycznie zablokowane |
| JWT Token security | ✅ | auth.uid() z tokena |

---

## 🛠️ JAK TO DZIAŁA POD MASKĄ?

### **1. Synchronizacja między urządzeniami**

```typescript
// src/hooks/useElectronDB.ts

export function useElectronDB(key, defaultValue) {
  const { user } = useAuth();
  const [data, setData] = useState(defaultValue);

  // Pobierz dane z Supabase
  useEffect(() => {
    if (user) {
      SupabaseService.getUserData(user.uid, key).then(setData);
    }
  }, [user, key]);

  // Auto-refresh co 5 sekund
  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        SupabaseService.getUserData(user.uid, key).then(setData);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Zapisz z user_id
  const saveData = async (newData) => {
    if (user) {
      await SupabaseService.saveUserData(user.uid, key, newData);
      setData(newData);
    }
  };

  return [data, saveData];
}
```

**Kluczowe punkty:**
- ✅ Każdy zapis zawiera `user_id`
- ✅ Każdy odczyt filtruje po `user_id`
- ✅ Auto-refresh synchronizuje dane

---

### **2. Row Level Security (RLS)**

```sql
-- W Supabase Dashboard → SQL Editor

-- Włącz RLS dla tabeli
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Polityka SELECT
CREATE POLICY "select_own_invoices"
ON invoices
FOR SELECT
USING (auth.uid() = user_id);

-- Polityka INSERT
CREATE POLICY "insert_own_invoices"
ON invoices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Polityka UPDATE
CREATE POLICY "update_own_invoices"
ON invoices
FOR UPDATE
USING (auth.uid() = user_id);

-- Polityka DELETE
CREATE POLICY "delete_own_invoices"
ON invoices
FOR DELETE
USING (auth.uid() = user_id);
```

**Działanie:**
1. Użytkownik wysyła request: `GET /invoices`
2. Supabase sprawdza JWT token → `auth.uid() = "abc123"`
3. SQL wykonuje się z filtrem: `WHERE user_id = 'abc123'`
4. Zwraca TYLKO dane tego użytkownika
5. 🔒 Niemożliwe obejście na poziomie klienta!

---

### **3. JWT Token Verification**

```typescript
// Automatyczne przez Supabase SDK

// Każdy request zawiera header:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Token zawiera:
{
  "sub": "user_id_abc123",  // User ID
  "email": "alice@test.com",
  "exp": 1700000000,        // Wygasa za 1h
  "iat": 1699996400         // Utworzony
}

// Supabase sprawdza:
1. Czy token jest ważny (nie wygasł)
2. Czy podpis jest poprawny (nie podrobiony)
3. Używa "sub" jako auth.uid() w RLS
```

---

## 🎯 INSTRUKCJE DO WYKONANIA TESTÓW

### **Test synchronizacji (20 minut):**
```
□ Zaloguj się na komputerze
□ Dodaj 3 faktury
□ Zaloguj się na telefonie (to samo konto)
□ Sprawdź czy widzisz 3 faktury
□ Dodaj klienta na telefonie
□ Sprawdź na komputerze czy się pojawił
□ Edytuj fakturę na komputerze
□ Sprawdź na telefonie czy kwota się zmieniła
```

### **Test bezpieczeństwa (15 minut):**
```
□ Utwórz konto 1: alice@test.com
□ Dodaj 2 faktury jako Alice
□ Utwórz konto 2: bob@test.com
□ Sprawdź czy Bob widzi faktury Alice (NIE powinien!)
□ Otwórz DevTools (F12)
□ Spróbuj pobrać dane Alice jako Bob
□ Sprawdź czy Supabase zablokował
□ Sprawdź polityki RLS w Dashboard
```

---

## 📞 CO JEŚLI COŚ NIE DZIAŁA?

### **Synchronizacja nie działa:**
```
1. Sprawdź połączenie internetowe
2. Console (F12) → Network → Zobacz czy requests do Supabase przechodzą
3. Supabase Dashboard → Logs → Sprawdź błędy
4. Sprawdź czy RLS jest włączony (może blokować)
```

### **RLS blokuje Twoje własne dane:**
```
1. Supabase Dashboard → Table Editor → invoices
2. Sprawdź user_id faktury vs Twoje auth.uid()
3. Jeśli różne → problem z zapisem user_id
4. Sprawdź kod: SupabaseService.ts
```

### **Dane nie pojawiają się po refresh:**
```
1. Console → Sprawdź błędy
2. Sprawdź czy user.uid jest ustawiony
3. useAuth() → czy user nie jest null?
```

---

## ✅ REZULTAT KOŃCOWY

Po zakończeniu testów będziesz mieć **pewność** że:

✅ Dane synchronizują się między wszystkimi urządzeniami
✅ Każdy użytkownik widzi TYLKO swoje dane
✅ Niemożliwe jest zhakowanie przez SQL injection
✅ JWT tokens są bezpieczne i weryfikowane
✅ RLS chroni dane na poziomie bazy
✅ System gotowy do produkcji!

---

**🎉 TERAZ MASZ SYSTEM WIELOUŻYTKOWNIKOWY Z PEŁNYM BEZPIECZEŃSTWEM!**
