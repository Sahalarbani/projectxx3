import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Admin } from './pages/Admin';
import { Inventory } from './pages/Inventory';
import { Debt } from './pages/Debt';
import { Finance } from './pages/Finance';
import { Settings as SettingsPage } from './pages/Settings';
import { Sidebar } from './components/Sidebar'; // Import the new Sidebar

// --- Layout Component ---
// This component wraps pages that should have the sidebar.
const MainLayout = () => {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* The Outlet will render the matched child route component */}
        <Outlet /> 
      </main>
    </div>
  );
};

// --- Main App ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('lumina_session');
    if (session) {
      try {
        const { role } = JSON.parse(session);
        setIsAuthenticated(true);
        setIsAdmin(role === 'admin');
      } catch (error) {
        console.error("Failed to parse session:", error);
        localStorage.removeItem('lumina_session');
      }
    }
  }, []);

  const handleLogin = (key: string, admin: boolean) => {
    setIsAuthenticated(true);
    setIsAdmin(admin);
    localStorage.setItem('lumina_session', JSON.stringify({ key, role: admin ? 'admin' : 'cashier', loginTime: Date.now() }));
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/pos"} />} 
        />
        
        {isAuthenticated ? (
          isAdmin ? (
             /* Admin Routes are separate from the main layout */
            <Route path="/admin" element={<Admin />} />
          ) : (
             /* Cashier Routes are wrapped in the MainLayout */
            <Route element={<MainLayout />}>
              <Route path="/pos" element={<POS />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/reports" element={<div>Reports Page</div>} />
              <Route path="/debt" element={<Debt />} />
              <Route path="/finance" element={<Finance />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          )
        ) : null}
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
