import React, { useState, useEffect } from 'react';
import { Save, Store } from 'lucide-react';
import { Button, Input, Card } from '../components/ui/Primitives';
import { db } from '../services/db';
import { ShopProfile } from '../types';

export const Settings: React.FC = () => {
  const [profile, setProfile] = useState<ShopProfile>({
    name: '', address: '', phone: '', footerMessage: ''
  });

  useEffect(() => {
    const load = async () => {
        const p = await db.getShopProfile();
        setProfile(p);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await db.saveShopProfile(profile);
    alert("Profile saved successfully!");
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-400 text-sm">Shop Configuration & Preferences</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
            <h3 className="flex items-center gap-2 font-bold mb-6 text-primary">
                <Store className="w-5 h-5" /> Shop Profile
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Shop Name</label>
                    <Input value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Address</label>
                    <Input value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Phone / WA</label>
                    <Input value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                </div>
                <div>
                    <label className="text-xs text-slate-400 mb-1 block">Receipt Footer Message</label>
                    <Input value={profile.footerMessage} onChange={e => setProfile({...profile, footerMessage: e.target.value})} />
                </div>
                <div className="pt-4">
                    <Button type="submit" className="w-full">
                        <Save className="w-4 h-4 mr-2" /> Save Profile
                    </Button>
                </div>
            </form>
        </Card>

        <Card>
            <h3 className="font-bold mb-4 text-slate-300">Application Info</h3>
            <div className="space-y-4 text-sm text-slate-400">
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Version</span>
                    <span className="text-white">2.5.0 (Beta)</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Build</span>
                    <span className="text-white">Lumina 2025</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                    <span>Database</span>
                    <span className="text-white">Firebase Firestore</span>
                </div>
                <div className="mt-4 p-4 bg-blue-500/10 rounded-xl text-blue-300 text-xs">
                    This application requires internet connection for Firebase Sync.
                </div>
            </div>
        </Card>
      </div>
    </div>
  );
};
