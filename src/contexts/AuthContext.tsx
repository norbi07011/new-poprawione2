/**
 * 🔐 Authentication Context
 * Zarządza stanem logowania użytkownika - FIREBASE AUTH
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/config/firebase';
import { toast } from 'sonner';

interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Konwersja Firebase User na nasz format
const convertUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser) return null;
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || null
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Nasłuchuj zmian stanu autentykacji Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(convertUser(firebaseUser));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Zalogowano pomyślnie!');
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      toast.success('✅ Konto utworzone! Możesz się teraz zalogować.');
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Zalogowano przez Google!');
    } catch (error: any) {
      console.error('Google sign in error:', error);
      throw new Error(getErrorMessage(error.code));
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast.success('Wylogowano pomyślnie');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Błąd wylogowania');
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Helper: Tłumaczenie błędów Firebase
function getErrorMessage(errorCode: string): string {
  if (errorCode.includes('invalid-credential')) return 'Nieprawidłowy email lub hasło';
  if (errorCode.includes('invalid-email')) return 'Nieprawidłowy adres email';
  if (errorCode.includes('user-not-found')) return 'Użytkownik nie istnieje';
  if (errorCode.includes('wrong-password')) return 'Nieprawidłowe hasło';
  if (errorCode.includes('email-already-in-use')) return 'Ten email jest już zajęty';
  if (errorCode.includes('weak-password')) return 'Hasło musi mieć min. 6 znaków';
  if (errorCode.includes('too-many-requests')) return 'Zbyt wiele prób. Spróbuj później';
  if (errorCode.includes('network-request-failed')) return 'Brak połączenia z internetem';
  return 'Wystąpił błąd. Spróbuj ponownie';
}
