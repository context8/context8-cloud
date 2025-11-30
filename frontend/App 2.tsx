import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Handle view changes - require auth for dashboard
  useEffect(() => {
    if (currentView === 'dashboard' && !isAuthenticated) {
      setCurrentView('login');
    }
  }, [currentView, isAuthenticated]);

  const handleLoginSuccess = (token: string, userData: { id: string; email: string }) => {
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    setCurrentView('home');
  };

  // Render login page without layout
  if (currentView === 'login') {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout
      currentView={currentView}
      onViewChange={setCurrentView}
      isAuthenticated={isAuthenticated}
      user={user}
      onLogout={handleLogout}
    >
      {currentView === 'home' ? <Home /> : <Dashboard />}
    </Layout>
  );
};

export default App;
