#!/usr/bin/env node

/**
 * 🔥 Firebase Setup Helper
 * Pomaga skonfigurować Firebase krok po kroku
 */

const readline = require('readline');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function openBrowser(url) {
  const start = process.platform === 'win32' ? 'start' : 
                process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${start} ${url}`);
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  log('\n🔥 FIREBASE SETUP HELPER - MESSU BOUW\n', 'cyan');
  log('Ten skrypt pomoże Ci skonfigurować Firebase krok po kroku.\n', 'bright');

  // KROK 1: Sprawdź czy projekt istnieje
  log('═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 1: Projekt Firebase', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  const hasProject = await question('Czy utworzyłeś już projekt Firebase? (tak/nie): ');
  
  if (hasProject.toLowerCase() !== 'tak') {
    log('\n📋 STWÓRZ PROJEKT FIREBASE:', 'yellow');
    log('1. Otwieram Firebase Console w przeglądarce...', 'green');
    openBrowser('https://console.firebase.google.com');
    
    log('2. Kliknij "Add project" / "Dodaj projekt"');
    log('3. Nazwa projektu: "MESSU BOUW" (lub dowolna)');
    log('4. Enable Google Analytics: TAK (zalecane)');
    log('5. Kliknij "Create project"\n');
    
    await question('Naciśnij ENTER gdy projekt będzie utworzony...');
  }

  // KROK 2: Dodaj Web App
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 2: Dodaj aplikację Web', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  const hasWebApp = await question('Czy dodałeś już aplikację Web (</> icon)? (tak/nie): ');
  
  if (hasWebApp.toLowerCase() !== 'tak') {
    log('\n📋 DODAJ WEB APP:', 'yellow');
    log('1. W Firebase Console kliknij ikonę "</>"');
    log('2. App nickname: "MESSU BOUW Web App"');
    log('3. NIE zaznaczaj "Firebase Hosting"');
    log('4. Kliknij "Register app"\n');
    
    await question('Naciśnij ENTER gdy app będzie dodana...');
  }

  // KROK 3: Skopiuj config
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 3: Firebase Config', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log('SKOPIUJ ten fragment kodu z Firebase Console:', 'yellow');
  log(`
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "twoj-projekt.firebaseapp.com",
  projectId: "twoj-projekt-id",
  storageBucket: "twoj-projekt.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
`, 'cyan');

  log('Wklej poniżej TYLKO wartości (bez "const firebaseConfig = ..."):\n', 'yellow');

  const apiKey = await question('apiKey: ');
  const authDomain = await question('authDomain: ');
  const projectId = await question('projectId: ');
  const storageBucket = await question('storageBucket: ');
  const messagingSenderId = await question('messagingSenderId: ');
  const appId = await question('appId: ');

  // KROK 4: Zapisz config
  const configPath = path.join(__dirname, 'src', 'config', 'firebase.ts');
  const configContent = `/**
 * 🔥 Firebase Configuration
 * Konfiguracja połączenia z Firebase
 */

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// DEMO_MODE: true = offline (localStorage), false = Firebase Cloud
export const DEMO_MODE = false; // ✅ CLOUD MODE ENABLED!

const firebaseConfig = {
  apiKey: "${apiKey}",
  authDomain: "${authDomain}",
  projectId: "${projectId}",
  storageBucket: "${storageBucket}",
  messagingSenderId: "${messagingSenderId}",
  appId: "${appId}"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
`;

  fs.writeFileSync(configPath, configContent, 'utf8');
  log('\n✅ Config zapisany do src/config/firebase.ts!', 'green');

  // KROK 5: Authentication
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 4: Włącz Authentication', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log('📋 W Firebase Console:', 'yellow');
  log('1. Menu → Authentication → "Get started"');
  log('2. Sign-in method:');
  log('   - Email/Password → Enable → Save');
  log('   - Google → Enable → wybierz support email → Save\n');

  openBrowser(`https://console.firebase.google.com/project/${projectId}/authentication/providers`);
  
  await question('Naciśnij ENTER gdy Authentication będzie włączone...');

  // KROK 6: Firestore
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 5: Utwórz Firestore Database', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log('📋 W Firebase Console:', 'yellow');
  log('1. Menu → Firestore Database → "Create database"');
  log('2. Start in: "test mode" (na początek)');
  log('3. Location: "europe-west1" (Amsterdam)');
  log('4. Kliknij "Enable"\n');

  openBrowser(`https://console.firebase.google.com/project/${projectId}/firestore`);
  
  await question('Naciśnij ENTER gdy Firestore będzie utworzone...');

  // KROK 7: Security Rules
  log('\n═══════════════════════════════════════════════════════════', 'blue');
  log('KROK 6: Ustaw Security Rules', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'blue');

  log('📋 W Firebase Console:', 'yellow');
  log('1. Firestore Database → zakładka "Rules"');
  log('2. USUŃ obecny kod');
  log('3. WKLEJ ten kod:\n', 'yellow');

  const rules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`;

  log(rules, 'cyan');
  log('\n4. Kliknij "Publish"\n');

  openBrowser(`https://console.firebase.google.com/project/${projectId}/firestore/rules`);

  await question('Naciśnij ENTER gdy Rules będą ustawione...');

  // PODSUMOWANIE
  log('\n═══════════════════════════════════════════════════════════', 'green');
  log('🎉 KONFIGURACJA ZAKOŃCZONA!', 'bright');
  log('═══════════════════════════════════════════════════════════\n', 'green');

  log('✅ Firebase config zapisany', 'green');
  log('✅ DEMO_MODE wyłączony (cloud mode aktywny)', 'green');
  log('✅ Linki do Authentication i Firestore otwarte\n', 'green');

  log('🚀 NASTĘPNE KROKI:', 'yellow');
  log('1. Restart aplikacji: npm run dev');
  log('2. Otwórz: http://localhost:5000');
  log('3. Zarejestruj nowe konto');
  log('4. Sprawdź Firebase Console → Authentication → Users\n');

  log('📝 Jeśli coś nie działa, sprawdź:', 'yellow');
  log('- DevTools Console (F12) - jakie błędy?');
  log('- Firebase Console → Authentication → włączone Email/Password?');
  log('- Firebase Console → Firestore → Rules ustawione?\n');

  rl.close();
}

main().catch(err => {
  log(`\n❌ Błąd: ${err.message}`, 'red');
  rl.close();
  process.exit(1);
});
