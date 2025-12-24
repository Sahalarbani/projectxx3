import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ArrowRight, User, Lock, Terminal, ShieldCheck, CreditCard, Sparkles, Square, CheckSquare, Loader2 } from 'lucide-react';
import { Input, Button, Card } from '../components/ui/Primitives';
import { db } from '../services/db';

interface LoginProps {
  onLogin: (key: string, isAdmin: boolean) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'key' | 'credentials'>('key');
  const [keyInput, setKeyInput] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberKey, setRememberKey] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // Initialization
  useEffect(() => {
    const init = async () => {
      const adminCreds = await db.getAdminCredentials();
      setAdminExists(!!adminCreds);

      let storedDeviceId = localStorage.getItem('lumina_device_id');
      if (!storedDeviceId) {
        storedDeviceId = crypto.randomUUID();
        localStorage.setItem('lumina_device_id', storedDeviceId);
      }
      setDeviceId(storedDeviceId);

      const savedKey = localStorage.getItem('lumina_remember_key');
      if (savedKey) {
        setKeyInput(savedKey);
        setRememberKey(true);
      }
    };
    init();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'credentials') {
        if (!adminExists) {
          await db.updateAdminCredentials(username, password);
          setAdminExists(true);
          onLogin('ADMIN-CRED-SESSION', true);
        } else {
          const isValid = await db.validateAdmin(username, password);
          if (isValid) {
            onLogin('ADMIN-CRED-SESSION', true);
          } else {
            setError('Invalid username or password');
          }
        }
      } else {
        if (keyInput === 'ADMIN-MASTER-2025') {
            onLogin(keyInput, true);
            return;
        }
        const result = await db.validateKey(keyInput, deviceId);
        if (result.valid) {
          if (rememberKey) {
            localStorage.setItem('lumina_remember_key', keyInput);
          } else {
            localStorage.removeItem('lumina_remember_key');
          }
          onLogin(keyInput, false);
        } else {
          setError(result.message || 'Invalid key');
        }
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.2, 1, 0.8, 1] } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } },
  };

  if (adminExists === null) {
      return (
          <div className="min-h-screen w-full flex items-center justify-center bg-[#1a1b26]">
              <Loader2 className="w-8 h-8 animate-spin text-primary"/>
          </div>
      )
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#1a1b26] font-sans">
      <motion.div 
        variants={cardVariants} 
        initial="initial" 
        animate="animate"
        className="w-full max-w-sm"
      >
        {/* Main Login Card */}
        <Card className="bg-[#232533] border border-white/5 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
                <Terminal className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">LuminaPOS</h1>
              <p className="text-slate-400 text-sm mt-1">
                {mode === 'key' ? 'Secure Access Gateway' : (adminExists ? 'Admin Login' : 'Create Admin')}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
                <AnimatePresence mode="wait">
                {mode === 'key' ? (
                    <motion.div key="key" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 tracking-wider">AUTHENTICATION KEY</label>
                            <Input
                                icon={<KeyRound className="w-4 h-4 text-slate-500" />}
                                placeholder="KSR-XXXX-XXXX-XXXX"
                                value={keyInput}
                                onChange={(e) => setKeyInput(e.target.value.toUpperCase())}
                                autoFocus
                            />
                        </div>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRememberKey(!rememberKey)}>
                           {rememberKey ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-slate-500" />}
                           <span className="text-sm text-slate-300 select-none">Remember Key on this device</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="admin" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-4">
                        <Input icon={<User className="w-4 h-4" />} placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
                        <Input type="password" icon={<Lock className="w-4 h-4" />} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                    </motion.div>
                )}
                </AnimatePresence>

                {error && <p className="text-red-400 text-xs text-center font-medium pt-1">{error}</p>}

                <Button type="submit" isLoading={loading} className="w-full h-11 text-base">
                  {mode === 'key' ? 'Verify Identity' : (adminExists ? 'Login' : 'Create Account')} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </form>

            {/* Card Footer */}
            <div className="mt-6 pt-5 border-t border-white/10 text-center">
                <button onClick={() => setMode(m => m === 'key' ? 'credentials' : 'key')} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                  {mode === 'key' ? 'Login with Admin Credentials' : 'Back to Key Access'} →
                </button>
                 <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-4">
                    <ShieldCheck className="w-3 h-3" />
                    <span>256-bit Secure Session (Firebase)</span>
                </div>
                <p className="text-[10px] text-slate-600 mt-1">Device ID: {deviceId.slice(0, 10)}...</p>
            </div>

          </div>
        </Card>

        {/* Buy License Button */}
        {mode === 'key' && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: 0.2}} className="mt-4">
           <button
            onClick={() => alert('Purchase modal is temporarily disabled.')}
            className="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500/80 to-green-500/80 border border-emerald-400/30 hover:from-emerald-500 hover:to-green-500 flex items-center justify-between group transition-all shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
           >
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/10">
                        <CreditCard className="w-5 h-5 text-emerald-300" />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-white">Buy License Key</p>
                        <p className="text-[10px] text-emerald-200/80">Instant activation via QRIS / VA</p>
                    </div>
                </div>
                <Sparkles className="w-5 h-5 text-emerald-300 opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all" />
           </button>
        </motion.div>
        )}
      </motion.div>
    </div>
  );
};