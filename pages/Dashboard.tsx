import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, ShoppingBag, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, Button } from '../components/ui/Primitives';
import { db } from '../services/db';
import { Transaction, Product } from '../types';

const StatCard = ({ title, value, icon, trend }: any) => (
  <Card className="p-5 flex items-center justify-between group hover:border-primary/30 transition-colors">
    <div>
      <p className="text-slate-400 text-xs uppercase font-semibold tracking-wider">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1 group-hover:text-primary transition-colors">{value}</h3>
      {trend && <p className="text-emerald-400 text-xs mt-1 flex items-center"><TrendingUp className="w-3 h-3 mr-1" /> {trend}</p>}
    </div>
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-300 group-hover:bg-primary/20 group-hover:text-primary transition-all">
      {icon}
    </div>
  </Card>
);

export const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
        try {
            const [txs, prods] = await Promise.all([
                db.getTransactions(),
                db.getProducts()
            ]);
            setTransactions(txs);
            setProducts(prods);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  // Calc stats
  const todayTotal = transactions.reduce((acc, curr) => acc + curr.total, 0);
  const totalTx = transactions.length;
  const avgTx = totalTx > 0 ? todayTotal / totalTx : 0;
  
  // Low stock check
  const lowStock = products.filter(p => p.stock < 20);

  // Mock data for chart (can be updated with real tx data logic if needed)
  const data = [
    { name: '08:00', amt: 240000 },
    { name: '10:00', amt: 139800 },
    { name: '12:00', amt: 980000 },
    { name: '14:00', amt: 390800 },
    { name: '16:00', amt: 480000 },
    { name: '18:00', amt: 380000 },
  ];

  if (loading) return <div className="p-10 text-center text-slate-500">Loading Dashboard...</div>;

  return (
    <div className="space-y-6 pb-20 lg:pb-0 animate-in fade-in duration-500">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-slate-400 text-sm">Welcome back</p>
        </div>
        <div className="px-4 py-2 bg-surface rounded-full border border-white/10 flex items-center gap-2 text-sm font-mono text-primary">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Revenue" value={`Rp ${todayTotal.toLocaleString()}`} icon={<DollarSign />} trend="+12.5%" />
        <StatCard title="Transactions" value={totalTx} icon={<ShoppingBag />} trend="+4.3%" />
        <StatCard title="Avg. Ticket" value={`Rp ${avgTx.toLocaleString()}`} icon={<TrendingUp />} />
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4 text-sm uppercase text-slate-400">Sales Velocity</h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="amt" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Alerts & Quick Actions */}
        <div className="space-y-4">
          <Card className="h-full">
            <h3 className="font-semibold mb-4 text-sm uppercase text-slate-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h3>
            <div className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-slate-500 text-sm">Inventory levels healthy.</p>
              ) : (
                lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-slate-800 bg-cover bg-center" style={{backgroundImage: `url(${p.image})`}} />
                      <div>
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.category}</p>
                      </div>
                    </div>
                    <span className="text-amber-500 text-xs font-bold">{p.stock} left</span>
                  </div>
                ))
              )}
            </div>
            <Button variant="outline" className="w-full mt-6 text-xs">View Full Inventory</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
