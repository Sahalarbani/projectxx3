import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, QrCode, ShoppingCart, Filter, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Input, Card, Badge } from '../components/ui/Primitives';
import { Product, CartItem, Transaction } from '../types';
import { db } from '../services/db';
import { printReceipt } from '../services/printer';
import { cn } from '../components/ui/Primitives';

export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await db.getProducts();
    setProducts(data);
    setLoading(false);
  };

  const filteredProducts = products.filter(p => 
    (category === 'All' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
        alert("Out of stock!");
        return;
    }
    
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
            alert("Max stock reached");
            return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    // Haptic
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const updateQty = (id: string, delta: number) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        if (newQty > product.stock && delta > 0) return item;
        return { ...item, quantity: Math.max(0, newQty) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const handleCheckout = async (method: 'cash' | 'qris' | 'card') => {
    if (cart.length === 0) return;
    
    const tx: Transaction = {
      id: Date.now().toString(),
      items: cart,
      total: cartTotal,
      date: new Date().toISOString(),
      paymentMethod: method,
      status: 'completed'
    };
    
    await db.addTransaction(tx);
    
    // Auto Print
    if (confirm("Transaction Successful! Print Receipt?")) {
        const profile = await db.getShopProfile();
        printReceipt(tx, profile);
    }
    
    setCart([]);
    setIsMobileCartOpen(false);
    // Refresh products to show updated stock
    loadProducts();
  };

  if(loading) return <div className="p-10 text-center">Loading Products...</div>;

  return (
    <div className="flex h-[calc(100vh-80px)] lg:h-screen lg:pt-0 overflow-hidden relative">
      
      {/* Product Section */}
      <div className="flex-1 flex flex-col p-4 lg:p-6 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between">
          <div className="relative flex-1 max-w-md">
            <Input 
              icon={<Search className="w-4 h-4" />} 
              placeholder="Search products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors",
                  category === cat ? "bg-primary text-white" : "bg-surface hover:bg-white/5 text-slate-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20 lg:pb-0">
          {filteredProducts.map(product => (
            <motion.div
              key={product.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => addToCart(product)}
              className="group cursor-pointer"
            >
              <Card className="p-0 overflow-hidden h-full flex flex-col border-0 bg-surface/30 hover:bg-surface/50 transition-colors">
                <div className="aspect-square bg-slate-800 relative">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.stock === 0 ? 'warning' : product.stock < 10 ? 'warning' : 'default'}>
                        {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                    </Badge>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-medium text-text">{product.name}</h3>
                  <div className="mt-auto pt-2 flex items-center justify-between">
                    <span className="text-primary font-bold">Rp {product.price.toLocaleString()}</span>
                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cart Section */}
      <AnimatePresence>
        {(isMobileCartOpen || window.innerWidth >= 1024) && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
              "fixed lg:relative inset-y-0 right-0 w-full lg:w-[400px] bg-background lg:bg-surface/10 lg:border-l lg:border-white/5 shadow-2xl z-50 flex flex-col backdrop-blur-xl lg:backdrop-blur-none",
              !isMobileCartOpen && "hidden lg:flex"
            )}
          >
            {/* Cart Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-surface/50 lg:bg-transparent">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Current Order
              </h2>
              <button onClick={() => setIsMobileCartOpen(false)} className="lg:hidden p-2 text-slate-400">
                Close
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-4">
                  <ShoppingCart className="w-12 h-12 opacity-20" />
                  <p>Cart is empty</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-3 bg-white/5 p-3 rounded-xl animate-in slide-in-from-right-10">
                    <img src={item.image} className="w-16 h-16 rounded-lg object-cover bg-slate-800" />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <span className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Rp {item.price.toLocaleString()} / unit</p>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><Minus className="w-3 h-3" /></button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center hover:bg-primary/30"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            <div className="p-6 bg-surface/50 lg:bg-transparent border-t border-white/5 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>Rp {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Tax (11%)</span>
                  <span>Rp {(cartTotal * 0.11).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span>Rp {(cartTotal * 1.11).toLocaleString()}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                 <Button variant="secondary" className="flex flex-col h-16 gap-1" onClick={() => handleCheckout('cash')}>
                    <Banknote className="w-5 h-5" /> <span className="text-[10px]">Cash</span>
                 </Button>
                 <Button variant="primary" className="flex flex-col h-16 gap-1" onClick={() => handleCheckout('qris')}>
                    <QrCode className="w-5 h-5" /> <span className="text-[10px]">QRIS</span>
                 </Button>
                 <Button variant="secondary" className="flex flex-col h-16 gap-1" onClick={() => handleCheckout('card')}>
                    <CreditCard className="w-5 h-5" /> <span className="text-[10px]">Card</span>
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Cart FAB */}
      {!isMobileCartOpen && cart.length > 0 && (
         <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setIsMobileCartOpen(true)}
            className="fixed lg:hidden bottom-20 right-4 h-14 w-14 rounded-full bg-accent text-white shadow-xl shadow-accent/40 flex items-center justify-center z-40"
         >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-background">
                {cart.reduce((a,b) => a + b.quantity, 0)}
              </span>
            </div>
         </motion.button>
      )}
    </div>
  );
};
