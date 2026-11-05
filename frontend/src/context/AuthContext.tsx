import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import {
  signUpUser,
  signInUser,
  signOutUser,
  fetchMe,
} from '../services/auth.service';
import type { AuthContextType, SignUpData, SignInData, User, Session } from '../types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Inizializzazione della sessione tramite cookie HttpOnly dal backend
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        const currentUser = await fetchMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Errore durante il recupero della sessione:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSignUp = useCallback(async (data: SignUpData) => {
    try {
      const res = await signUpUser(data);
      if (res.user) {
        setUser(res.user);
      }
      return {
        user: res.user,
        session: res.session,
        confirmationRequired: res.confirmationRequired,
        error: null,
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        user: null,
        session: null,
        confirmationRequired: false,
        error,
      };
    }
  }, []);

  const handleSignIn = useCallback(async (data: SignInData) => {
    try {
      const res = await signInUser(data);
      if (res.user) {
        setUser(res.user);
      }
      return {
        user: res.user,
        session: res.session,
        error: null,
      };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return {
        user: null,
        session: null,
        error,
      };
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutUser();
      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      return { error };
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      signUp: handleSignUp,
      signIn: handleSignIn,
      signOut: handleSignOut,
    }),
    [user, session, loading, handleSignUp, handleSignIn, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere utilizzato all\'interno di un AuthProvider');
  }
  return context;
}
