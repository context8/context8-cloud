import * as React from 'react';

export type Session = {
  token: string;
  email: string;
};

export type SessionState = {
  session: Session | null;
  apiKey: string | null;
};

export type SessionActions = {
  login: (token: string, email: string) => void;
  logout: () => void;
  setApiKey: (apiKey: string | null) => void;
};

const STORAGE_KEYS = {
  token: 'ctx8_token',
  email: 'ctx8_email',
  apiKey: 'ctx8_apikey',
};

type SessionContextValue = SessionState & SessionActions;

const SessionContext = React.createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [apiKey, setApiKeyState] = React.useState<string | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const email = localStorage.getItem(STORAGE_KEYS.email);
    const storedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
    if (token && email) {
      setSession({ token, email });
    }
    if (storedKey) {
      setApiKeyState(storedKey);
    }
  }, []);

  const login = React.useCallback((token: string, email: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    setSession({ token, email: normalizedEmail });
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.email, normalizedEmail);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.email);
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    setSession(null);
    setApiKeyState(null);
  }, []);

  const setApiKey = React.useCallback((key: string | null) => {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.apiKey, key);
    } else {
      localStorage.removeItem(STORAGE_KEYS.apiKey);
    }
    setApiKeyState(key);
  }, []);

  const value: SessionContextValue = React.useMemo(
    () => ({
      session,
      apiKey,
      login,
      logout,
      setApiKey,
    }),
    [session, apiKey, login, logout, setApiKey]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return ctx;
}

