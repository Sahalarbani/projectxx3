import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, ShoppingBag, Package, BarChart3, Settings, LogOut, ChevronRight, Menu } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'POS', icon: ShoppingBag, path: '/pos' },
  { name: 'Products', icon: Package, path: '/products' },
  { name: 'Reports', icon: BarChart3, path: '/reports' },
];

export const Sidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    return (
        <li 
            key={item.name}
            onClick={() => { navigate(item.path); setIsMobileOpen(false); }}
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors 
                        ${isActive ? 'bg-primary text-white' : 'hover:bg-white/10 text-slate-300'}`}>
            <item.icon className="w-6 h-6 flex-shrink-0" />
            <span className={`ml-4 font-medium transition-opacity duration-300 ${isExpanded || isMobileOpen ? 'opacity-100' : 'opacity-0 md:opacity-0'}`}>
                {item.name}
            </span>
        </li>
    );
  }

  const SidebarContent = () => (
    <div 
        className="h-full flex flex-col bg-surface border-r border-white/10 text-white p-3"
        onMouseEnter={() => window.innerWidth > 768 && setIsExpanded(true)}
        onMouseLeave={() => window.innerWidth > 768 && setIsExpanded(false)}
    >
        <div className="flex items-center p-3 mb-6">
            <motion.div animate={{ rotate: isExpanded ? 0 : 180 }}>
                <ChevronRight className="w-8 h-8 p-1 rounded-full bg-primary text-white"/>
            </motion.div>
            <span className={`ml-2 text-xl font-bold transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}>LUMINA</span>
        </div>

        <ul className="flex-1">{
            navItems.map(item => <NavLink item={item} key={item.path} />)
        }</ul>

        <div>
            <NavLink item={{ name: 'Settings', icon: Settings, path: '/settings'}} />
            <NavLink item={{ name: 'Logout', icon: LogOut, path: '/login'}} />
        </div>
    </div>
  );

  return (
    <>
        {/* Mobile Menu Button */}
        <button onClick={() => setIsMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-40 p-2 rounded-md bg-surface/50 backdrop-blur-sm">
            <Menu className="w-6 h-6 text-white" />
        </button>

        {/* Mobile Sidebar (Overlay) */}
        {isMobileOpen && (
            <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed inset-y-0 left-0 w-64 bg-surface z-50 md:hidden"
            >
                <SidebarContent />
            </motion.div>
        )}
        {isMobileOpen && <div onClick={() => setIsMobileOpen(false)} className="fixed inset-0 bg-black/60 z-40 md:hidden" />}

        {/* Desktop Sidebar */}
        <motion.div 
            animate={{ width: isExpanded ? 256 : 80 }}
            className="hidden md:block flex-shrink-0 h-screen relative"
        >
            <SidebarContent />
        </motion.div>
    </>
  );
};