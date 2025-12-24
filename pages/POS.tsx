import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, List, Search, ShoppingCart, Plus, Minus, X, Loader2 } from 'lucide-react';
import { Input, Button, Card, Badge } from '../components/ui/Primitives';
import { db } from '../services/db';
import { Product, Transaction } from '../types';
import { printReceipt } from '../services/printer';
import { useDebounce } from '../hooks/useDebounce';

// --- Product Card Component ---
const ProductCard = ({ product, onAddToCart }: { product: Product, onAddToCart: (product: Product) => void }) => (
  <Card 
    onClick={() => onAddToCart(product)}
    className="p-0 flex flex-col h-full overflow-hidden group cursor-pointer hover:border-primary-600 transition-colors duration-200"
  >
    <div className="relative pt-[100%]">
      <img src={product.image} alt={product.name} className="absolute top-0 left-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
      {product.stock <= 5 && <Badge variant={product.stock === 0 ? 'danger' : 'warning'} className="absolute top-2 right-2">{product.stock} left</Badge>}
    </div>
    <div className="p-4 flex-1 flex flex-col">
      <h3 className="font-semibold text-sm text-text flex-1">{product.name}</h3>
      <p className="font-mono text-lg text-primary-400 font-bold mt-2">Rp{product.price.toLocaleString()}</p>
    </div>
  </Card>
);


// --- Cart View Component ---
const CartView = ({ cart, onUpdateQuantity, onCheckout }: { 
  cart: any[], 
  onUpdateQuantity: (id: string, amount: number) => void,
  onCheckout: (method: 'cash' | 'qris' | 'card') => void
}) => {
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="h-full flex flex-col bg-surface">
      <div className="p-4 border-b border-white/10 flex-shrink-0">
        <h2 className="text-lg font-bold flex items-center"><ShoppingCart className="w-5 h-5 mr-3"/>Current Order</h2>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center text-text-muted py-10">
            <p>Your cart is empty.</p>
          </div>
        ) : (
          cart.map(item => (
            <motion.div key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4">
              <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-text">{item.name}</p>
                <p className="text-xs text-primary-400">Rp{item.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, -1)}><Minus className="w-4 h-4"/></Button>
                <span className="font-mono text-sm w-5 text-center">{item.quantity}</span>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onUpdateQuantity(item.id, 1)}><Plus className="w-4 h-4"/></Button>
              </div>
            </motion.div>
          ))
        )}
      </div>
      
      {cart.length > 0 && (
        <div className="p-4 border-t border-white/10 space-y-4 flex-shrink-0">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span className="text-primary-400">Rp{cartTotal.toLocaleString()}</span>
          </div>
          <Button onClick={() => onCheckout('qris')} variant="secondary" size="lg" className="w-full">Confirm & Checkout</Button>
          <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => onCheckout('cash')} variant="outline">Cash</Button>
              <Button onClick={() => onCheckout('card')} variant="outline">Card</Button>
          </div>
        </div>
      )}
    </div>
  );
};


// --- Main POS Page ---
export const POS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const loadProducts = async () => {
    setLoading(true);
    const prods = await db.getProducts();
    setProducts(prods);
    setFilteredProducts(prods);
    setLoading(false);
  }

  useEffect(() => { loadProducts(); }, []);

  useEffect(() => {
    const result = products.filter(p => 
      p.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    setFilteredProducts(result);
  }, [debouncedSearchTerm, products]);

  const addToCart = (product: Product) => {
    if (product.stock === 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (id: string, amount: number) => {
    setCart(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + amount) } : item
      ).filter(item => item.quantity > 0)
    );
  };

  const handleCheckout = async (method: 'cash' | 'qris' | 'card') => {
    if (cart.length === 0) return;
    const tx: Transaction = { id: crypto.randomUUID(), items: cart, total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), date: new Date().toISOString(), paymentMethod: method, status: 'completed' };
    await db.addTransaction(tx);
    if (confirm("Print Receipt?")) {
      const profile = await db.getShopProfile();
      printReceipt(tx, profile);
    }
    setCart([]);
    setIsMobileCartOpen(false);
    loadProducts();
  };

  return (
    <div className="flex h-screen bg-background">
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex-shrink-0 bg-surface border-b border-white/10 z-10">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1">
              <Input icon={<Search className="w-4 h-4"/>} placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="icon" onClick={() => setViewMode('grid')}><Grid className="w-5 h-5"/></Button>
              <Button variant={viewMode === 'list' ? 'primary' : 'outline'} size="icon" onClick={() => setViewMode('list')}><List className="w-5 h-5"/></Button>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-full"><Loader2 className="w-8 h-8 animate-spin text-primary"/></div>
            ) : (
              <motion.div layout className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' : 'grid-cols-1'} gap-4`}>
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAddToCart={addToCart} /> )}
              </motion.div>
            )}
          </div>

          <aside className="hidden lg:block w-[380px] flex-shrink-0 border-l border-white/10">
            <CartView cart={cart} onUpdateQuantity={updateQuantity} onCheckout={handleCheckout} />
          </aside>
        </div>
      </main>

      <div className="lg:hidden fixed bottom-5 right-5 z-20">
        <Button onClick={() => setIsMobileCartOpen(true)} size="lg" className="rounded-full shadow-lg shadow-primary/40 h-16 w-16">
          <ShoppingCart className="w-7 h-7" />
          {cart.length > 0 && <Badge variant="danger" className="absolute top-0 right-0">{cart.length}</Badge>}
        </Button>
      </div>

      <AnimatePresence>
        {isMobileCartOpen && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="lg:hidden fixed inset-0 z-30 flex flex-col"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileCartOpen(false)}></div>
            <div className="relative mt-auto h-[90vh] bg-surface rounded-t-2xl flex flex-col overflow-hidden">
              <div className="w-full py-3 flex justify-center items-center flex-shrink-0" onClick={() => setIsMobileCartOpen(false)}>
                <div className="w-16 h-1.5 bg-white/20 rounded-full" />
              </div>
              <CartView cart={cart} onUpdateQuantity={updateQuantity} onCheckout={handleCheckout} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};