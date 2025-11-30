import React, { useEffect, useMemo, useState } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { View } from './types';

type Session = {
  token: string;
  email: string;
};

const STORAGE_KEYS = {
  token: 'ctx8_token',
  email: 'ctx8_email',
  apiKey: 'ctx8_apikey',
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(STORAGE_KEYS.token);
    const email = localStorage.getItem(STORAGE_KEYS.email);
    const storedKey = localStorage.getItem(STORAGE_KEYS.apiKey);
    if (token && email) {
      setSession({ token, email });
    }
    if (storedKey) {
      setApiKey(storedKey);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.email);
    localStorage.removeItem(STORAGE_KEYS.apiKey);
    setSession(null);
    setApiKey(null);
    setCurrentView('home');
  };

  const sessionValue = useMemo(
    () => ({ session, setSession, apiKey, setApiKey }),
    [session, apiKey]
  );

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      user={session ? { email: session.email } : undefined}
      onLogout={session ? handleLogout : undefined}
    >
      {currentView === 'home' ? (
        <Home />
      ) : (
        <Dashboard sessionState={sessionValue} />
      )}
    </Layout>
  );
};

export default App;
