import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Button, Input, Card } from '../components/ui/Primitives';
import { db } from '../services/db';
import { FinancialRecord } from '../types';

export const Finance: React.FC = () => {
  const [records, setRecords] = useState<FinancialRecord[]>([]);
  const [tab, setTab] = useState<'all' | 'income' | 'expense'>('all');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [desc, setDesc] = useState('');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await db.getFinancialRecords();
    setRecords(data);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: FinancialRecord = {
      id: Date.now().toString(),
      type,
      amount: Number(amount),
      category: category || 'General',
      description: desc,
      date: new Date().toISOString()
    };
    await db.addFinancialRecord(newRecord);
    await loadRecords();
    setAmount(''); setCategory(''); setDesc('');
  };

  const filtered = records.filter(r => tab === 'all' || r.type === tab);
  const totalIncome = records.filter(r => r.type === 'income').reduce((a, b) => a + b.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((a, b) => a + b.amount, 0);

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24">
      <header>
        <h1 className="text-2xl font-bold">Finance</h1>
        <p className="text-slate-400 text-sm">Operational Expenses & Income</p>
      </header>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
                <ArrowDownRight className="w-5 h-5" /> <span className="font-semibold uppercase text-xs">Total Income</span>
            </div>
            <h2 className="text-2xl font-bold text-emerald-100">Rp {totalIncome.toLocaleString()}</h2>
        </Card>
        <Card className="p-4 bg-red-500/5 border-red-500/20">
            <div className="flex items-center gap-2 mb-2 text-red-400">
                <ArrowUpRight className="w-5 h-5" /> <span className="font-semibold uppercase text-xs">Total Expense</span>
            </div>
            <h2 className="text-2xl font-bold text-red-100">Rp {totalExpense.toLocaleString()}</h2>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <Card className="h-fit">
            <h3 className="font-bold mb-4 border-b border-white/10 pb-2">New Entry</h3>
            <div className="flex gap-2 mb-4">
                <button onClick={() => setType('expense')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'bg-surface text-slate-400'}`}>Expense</button>
                <button onClick={() => setType('income')} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-surface text-slate-400'}`}>Income</button>
            </div>
            <form onSubmit={handleAdd} className="space-y-3">
                <Input placeholder="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />
                <Input placeholder="Category (e.g. Electricity)" value={category} onChange={e => setCategory(e.target.value)} required />
                <Input placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
                <Button type="submit" className="w-full" variant={type === 'income' ? 'primary' : 'danger'}>
                    <Plus className="w-4 h-4 mr-2" /> Record
                </Button>
            </form>
        </Card>

        {/* List */}
        <Card className="lg:col-span-2">
            <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
                {['all', 'income', 'expense'].map(t => (
                    <button key={t} onClick={() => setTab(t as any)} className={`px-3 py-1 text-xs rounded-full capitalize ${tab === t ? 'bg-white/10 text-white' : 'text-slate-500'}`}>
                        {t}
                    </button>
                ))}
            </div>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filtered.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-3 rounded bg-white/5">
                        <div>
                            <p className="font-medium text-sm">{r.category}</p>
                            <p className="text-xs text-slate-400">{r.description} • {new Date(r.date).toLocaleDateString()}</p>
                        </div>
                        <span className={`font-mono font-bold ${r.type === 'income' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {r.type === 'income' ? '+' : '-'} Rp {r.amount.toLocaleString()}
                        </span>
                    </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-slate-500 text-sm py-4">No records found.</p>}
            </div>
        </Card>
      </div>
    </div>
  );
};
