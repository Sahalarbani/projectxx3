import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Key, LogOut, Package, Wallet, Banknote, Settings, Shield } from 'lucide-react';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { Admin } from './pages/Admin';
import { Inventory } from './pages/Inventory';
import { Debt } from './pages/Debt';
import { Finance } from './pages/Finance';
import { Settings as SettingsPage } from './pages/Settings';
import { cn } from './components/ui/Primitives';

// --- Sidebar/Nav Component ---
const Navigation = ({ isAdmin, onLogout }: { isAdmin: boolean; onLogout: () => void }) => {
  const location = useLocation();
  
  // Define menus based on role
  const cashierItems = [
    { icon: <LayoutDashboard />, label: 'Dashboard', path: '/dashboard' },
    { icon: <ShoppingCart />, label: 'POS', path: '/pos' },
    { icon: <Package />, label: 'Inventory', path: '/inventory' },
    { icon: <Wallet />, label: 'Debt', path: '/debt' },
    { icon: <Banknote />, label: 'Finance', path: '/finance' },
    { icon: <Settings />, label: 'Settings', path: '/settings' },
  ];

  const adminItems = [
    { icon: <Shield />, label: 'Admin Panel', path: '/admin' },
  ];

  const navItems = isAdmin ? adminItems : cashierItems;

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen border-r border-white/5 bg-background fixed left-0 top-0 overflow-y-auto">
        <div className="p-6 flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${isAdmin ? 'from-slate-700 to-slate-900' : 'from-primary to-purple-600'}`} />
          <span className="font-bold text-xl tracking-tight">{isAdmin ? 'SaaS Admin' : 'LuminaPOS'}</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all group",
                location.pathname === item.path 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <span className={cn(location.pathname === item.path ? "text-white" : "text-slate-500 group-hover:text-white")}>
                 {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
              </span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full bg-background/80 backdrop-blur-xl border-t border-white/5 flex justify-around p-2 z-50 pb-safe overflow-x-auto no-scrollbar">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
              location.pathname === item.path ? "text-primary" : "text-slate-500"
            )}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 20 })}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        <button onClick={onLogout} className="flex flex-col items-center gap-1 p-2 rounded-lg text-slate-500 min-w-[60px]">
           <LogOut size={20} />
           <span className="text-[10px] font-medium">Exit</span>
        </button>
      </nav>
    </>
  );
};

// --- Main App ---
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = localStorage.getItem('lumina_session');
    if (session) {
      const { role } = JSON.parse(session);
      setIsAuthenticated(true);
      setIsAdmin(role === 'admin');
    }
  }, []);

  const handleLogin = (key: string, admin: boolean) => {
    setIsAuthenticated(true);
    setIsAdmin(admin);
    localStorage.setItem('lumina_session', JSON.stringify({ key, role: admin ? 'admin' : 'cashier', loginTime: Date.now() }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('lumina_session');
  };

  return (
    <Router>
      <div className="min-h-screen bg-background text-text font-sans antialiased">
        {isAuthenticated && <Navigation isAdmin={isAdmin} onLogout={handleLogout} />}
        
        <main className={cn("transition-all", isAuthenticated ? "lg:ml-64 pb-24 lg:pb-0" : "")}>
          <Routes>
            <Route 
              path="/" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to={isAdmin ? "/admin" : "/dashboard"} />} 
            />
            
            {isAuthenticated ? (
              isAdmin ? (
                 /* Admin Routes - Only Admin Page */
                 <>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="*" element={<Navigate to="/admin" />} />
                 </>
              ) : (
                 /* Cashier Routes - Normal App */
                 <>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/pos" element={<POS />} />
                    <Route path="/inventory" element={<Inventory />} />
                    <Route path="/debt" element={<Debt />} />
                    <Route path="/finance" element={<Finance />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="*" element={<Navigate to="/dashboard" />} />
                 </>
              )
            ) : (
              <Route path="*" element={<Navigate to="/" />} />
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;