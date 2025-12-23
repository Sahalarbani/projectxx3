import React, { useState, useEffect, useRef } from 'react';
import { Plus, Search, Edit2, Trash2, Camera, Upload, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { Button, Input, Card, Badge } from '../components/ui/Primitives';
import { db } from '../services/db';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export const Inventory: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, category: 'General', stock: 0, image: 'https://picsum.photos/200'
  });

  // AI State
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await db.getProducts();
    setProducts(data);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const product: Product = {
      id: editingProduct ? editingProduct.id : Date.now().toString(),
      name: formData.name!,
      price: Number(formData.price),
      category: formData.category || 'General',
      stock: Number(formData.stock) || 0,
      image: formData.image || 'https://picsum.photos/200'
    };

    await db.saveProduct(product);
    await loadProducts();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this product?")) {
      await db.deleteProduct(id);
      await loadProducts();
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: 0, category: 'General', stock: 0, image: 'https://picsum.photos/200' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  // --- AI Logic ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAnalyzing(true);
    
    try {
      const apiKey = process.env.API_KEY || ''; 
      
      if (!apiKey) {
        setTimeout(async () => {
           const simulatedProducts: Product[] = [
             { id: Date.now().toString(), name: "AI Detect: Milk", price: 25000, category: "Dairy", stock: 12, image: "https://picsum.photos/200" },
             { id: (Date.now()+1).toString(), name: "AI Detect: Sugar", price: 15000, category: "Pantry", stock: 5, image: "https://picsum.photos/200" }
           ];
           for (const p of simulatedProducts) {
             await db.saveProduct(p);
           }
           await loadProducts();
           setAnalyzing(false);
           setIsAiModalOpen(false);
           alert("Simulated AI: Added 2 items from receipt!");
        }, 2000);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    inlineData: {
                        mimeType: file.type,
                        data: base64Data
                    }
                },
                { text: "Analyze this receipt image. Extract all items purchased. Return a JSON list where each item has: name (string), price (number), quantity (number, use as stock). Do not include currency symbols." }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            price: { type: Type.NUMBER },
                            stock: { type: Type.NUMBER }
                        }
                    }
                }
            }
        });

        const items = JSON.parse(response.text || '[]');
        
        let count = 0;
        for (const item of items) {
            const newProd: Product = {
                id: Date.now().toString() + Math.random(),
                name: item.name,
                price: item.price,
                category: "Imported",
                stock: item.stock || 1,
                image: "https://picsum.photos/200?random=" + Math.random()
            };
            await db.saveProduct(newProd);
            count++;
        }

        await loadProducts();
        setAnalyzing(false);
        setIsAiModalOpen(false);
        alert(`AI added ${count} items from receipt!`);
      };

    } catch (error) {
      console.error(error);
      alert("AI Analysis failed. Check console or API Key.");
      setAnalyzing(false);
    }
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-24">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventory</h1>
          <p className="text-slate-400 text-sm">Manage stock & products</p>
        </div>
        <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAiModalOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2 text-accent" /> AI Scan
            </Button>
            <Button onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
        </div>
      </header>

      <Card>
        <div className="mb-4">
            <Input 
                icon={<Search className="w-4 h-4" />} 
                placeholder="Search inventory..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
            />
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
                <thead className="text-slate-400 border-b border-white/10">
                    <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock</th>
                        <th className="p-3 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filtered.map(p => (
                        <tr key={p.id} className="group hover:bg-white/5">
                            <td className="p-3 flex items-center gap-3">
                                <img src={p.image} className="w-8 h-8 rounded bg-slate-800 object-cover" />
                                <span className="font-medium">{p.name}</span>
                            </td>
                            <td className="p-3">{p.category}</td>
                            <td className="p-3">Rp {p.price.toLocaleString()}</td>
                            <td className="p-3">
                                <Badge variant={p.stock < 10 ? 'warning' : 'success'}>{p.stock}</Badge>
                            </td>
                            <td className="p-3 text-right">
                                <button onClick={() => openModal(p)} className="p-2 hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(p.id)} className="p-2 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </Card>

      {/* Manual Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className="w-full max-w-md">
                <Card className="bg-surface border border-white/10">
                    <h3 className="text-xl font-bold mb-4">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400">Name</label>
                            <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-400">Price</label>
                                <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} required />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400">Stock</label>
                                <Input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} required />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-slate-400">Category</label>
                            <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                            <Button type="submit">Save Product</Button>
                        </div>
                    </form>
                </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{scale: 0.9, opacity: 0}} animate={{scale: 1, opacity: 1}} exit={{scale: 0.9, opacity: 0}} className="w-full max-w-md">
                <Card className="bg-surface border border-white/10 text-center py-10">
                    <div className="mb-6 flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                            {analyzing ? <Loader2 className="w-10 h-10 text-white animate-spin" /> : <Camera className="w-10 h-10 text-white" />}
                        </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Scan Receipt</h3>
                    <p className="text-slate-400 text-sm mb-6 px-8">
                        Upload a photo of your supplier receipt. Our AI will extract items, prices, and quantities automatically.
                    </p>
                    
                    <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef} 
                        onChange={handleFileUpload} 
                    />
                    
                    <div className="flex justify-center gap-3">
                        <Button variant="ghost" onClick={() => setIsAiModalOpen(false)} disabled={analyzing}>Cancel</Button>
                        <Button onClick={() => fileInputRef.current?.click()} disabled={analyzing} className="relative overflow-hidden">
                             {analyzing ? 'Analyzing...' : 'Select Image'}
                             <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] pointer-events-none" />
                        </Button>
                    </div>
                </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
