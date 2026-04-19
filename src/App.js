import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInAnonymously, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  serverTimestamp, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  ShoppingBag, User, Plus, Minus, Trash2, X, CheckCircle, Check as CheckIcon, 
  ChevronLeft, Search, Upload, Star, Lock, Key, Layers, Wand2, Instagram,
  Phone, LayoutDashboard, ArrowRight, Loader2, MapPin, Mail, Download,
  Calendar, ShieldAlert, ChevronRight, Info, Heart, Share2, Sparkles,
  Zap, ShoppingBasket, CreditCard, Truck, Verified, Globe, Settings,
  AlertCircle, Scissors, Palette, Gift, RefreshCw, Crown, TrendingUp,
  Award, ShieldCheck, MousePointer2, Box, Facebook, Twitter, MessageCircle,
  PieChart, Users, Bell, ArrowUpRight, Eye, History, FileText, Activity,
  Tag, CreditCard as PaymentIcon, ShoppingBag as BagIcon, Map,
  Truck as DeliveryIcon, Check as SuccessIcon, ChevronDown, ArrowDownRight,
  Filter, LogOut, Edit, ExternalLink, ChevronUp, Target, ZapOff,
  UserCheck, Award as AwardIcon, BarChart3, Globe2, 
  ShoppingBag as ShoppingBagIcon, ChevronRight as ChevronRightIcon,
  X as CloseIcon, ArrowRight as ArrowRightIcon, HeartPulse, Bookmark,
  Smartphone, Cpu, Trophy, Coffee, Diamond, Briefcase, 
  Layers as LayersMenu, Image as ImageIcon, ToggleLeft, ToggleRight,
  Store, PackageSearch, Image as LucideImage, Menu, MapPinned
} from 'lucide-react';

/**
 * ==========================================================================================
 * --- OFFICIAL CATALOG SYSTEM ---
 * VERSION: 49.0.0 (MOBILE LOGIN FIX - FULL FIREBASE PERSISTENCE)
 * ==========================================================================================
 */

const firebaseConfig = {
  apiKey: "AIzaSyDof4Lbf1WIr1LWhJYcZ5R_9DOH2L_HYNo",
  authDomain: "webbaru-6fb99.firebaseapp.com",
  projectId: "webbaru-6fb99",
  storageBucket: "webbaru-6fb99.firebasestorage.app",
  messagingSenderId: "414880777293",
  appId: "1:414880777293:web:3c9738dbb6cce7e58ac804",
  measurementId: "G-1DRB4HSG6R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'webbaru-boutique-v1';

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];
const AGE_OPTIONS = ['1-2 Thn', '3-4 Thn', '5-6 Thn', '7-8 Thn', '9-10 Thn', '11-12 Thn'];

const BANK_LOGOS = {
  "BANK CENTRAL ASIA (BCA)": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
  "BANK MANDIRI": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
  "BANK RAKYAT INDONESIA (BRI)": "https://upload.wikimedia.org/wikipedia/commons/2/2e/BRI_Logo.svg",
  "BANK NEGARA INDONESIA (BNI)": "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Negara_Indonesia.svg",
  "BANK CIMB NIAGA": "https://upload.wikimedia.org/wikipedia/commons/4/4c/CIMB_Niaga_logo.svg",
  "GOPAY": "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
  "DANA": "https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_dana_blue.svg",
  "OVO": "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
  "SHOPEEPAY": "https://upload.wikimedia.org/wikipedia/commons/b/be/ShopeePay.svg"
};

const BANK_LIST = Object.keys(BANK_LOGOS);

const DEFAULT_SHIPPING = [
  { id: 'jne_reg', name: 'JNE - REG', price: 10000, logo: '/logo1.png' },
  { id: 'jnt_reg', name: 'J&T EXPRESS', price: 11000, logo: '/logo2.png' },
  { id: 'anteraja', name: 'ANTERAJA', price: 9000, logo: '/logo3.png' },
  { id: 'sicepat', name: 'SICEPAT EKSPRES', price: 10000, logo: '/logo4.png' },
  { id: 'ninja', name: 'NINJA XPRESS', price: 10500, logo: '/logo5.png' }
];

const formatIDR = (amount) => {
  const val = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', { 
    style: 'currency', 
    currency: 'IDR', 
    maximumFractionDigits: 0 
  }).format(val);
};

const compressImage = (file, maxWidth = 1024) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
    };
  });
};

export default function App() {
  const [view, setView] = useState('shop'); 
  const [user, setUser] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [rekening, setRekening] = useState([]);
  const [shippingMethods, setShippingMethods] = useState(DEFAULT_SHIPPING);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [storeName, setStoreName] = useState(''); 
  const [loadingData, setLoadingData] = useState(true);

  const notify = (message, type = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message: String(message), type }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          try { await signInWithCustomToken(auth, __initial_auth_token); } catch (e) { await signInAnonymously(auth); }
        } else { await signInAnonymously(auth); }
      } catch (err) { console.error("Auth error:", err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => { if (u) setUser(u); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    // Sync Products
    const pRef = collection(db, 'artifacts', appId, 'public', 'data', 'products');
    const unsubP = onSnapshot(pRef, (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingData(false);
    });

    // Sync Store Config
    const sRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config');
    const unsubS = onSnapshot(sRef, (docSnap) => {
      if (docSnap.exists()) setStoreName(docSnap.data().storeName || '');
    });

    // Sync Bank Accounts
    const bRef = collection(db, 'artifacts', appId, 'public', 'data', 'rekening');
    const unsubB = onSnapshot(bRef, (snap) => {
      setRekening(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Sync Shipping
    const shRef = doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'shipping');
    const unsubSh = onSnapshot(shRef, (docSnap) => {
      if (docSnap.exists()) setShippingMethods(docSnap.data().methods || DEFAULT_SHIPPING);
    });

    let unsubO = () => {};
    if (isAdminLoggedIn) {
      const oRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      unsubO = onSnapshot(oRef, (snap) => setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
    }
    return () => { unsubP(); unsubS(); unsubB(); unsubSh(); unsubO(); };
  }, [user, isAdminLoggedIn]);

  const filteredProducts = useMemo(() => products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase())), [products, searchTerm]);

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans antialiased overflow-x-hidden selection:bg-[#449e48] selection:text-white">
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 w-full max-w-xs px-4 pointer-events-none">
        {notifications.map(n => <NotificationItem key={n.id} notification={n} />)}
      </div>

      <Header storeName={storeName} cartCount={cart.length} isAdmin={isAdminLoggedIn} setView={setView} />

      <main className="max-w-7xl mx-auto pb-20 pt-16">
        {view === 'shop' && (
          <div className="animate-in fade-in duration-500">
            <HeroSection />
            <div className="px-4">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">Koleksi Terkini</h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" size={14} />
                    <input type="text" placeholder="Cari Koleksi..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-zinc-50 border border-zinc-100 rounded-full pl-9 pr-4 py-2 text-[11px] w-40 outline-none focus:w-64 transition-all" />
                 </div>
              </div>
              <ProductGrid products={filteredProducts} loading={loadingData} onView={(p) => { setSelectedProduct(p); setView('detail'); window.scrollTo(0,0); }} onGoToAdmin={() => setView('login')} />
            </div>
          </div>
        )}

        {view === 'detail' && selectedProduct && (
          <div className="px-4 pt-10">
            <ProductDetailView 
              product={selectedProduct} onBack={() => setView('shop')} 
              onBuy={(size, age, price, qty) => { 
                const item = {...selectedProduct, chosenSize: size, chosenAge: age, chosenPrice: price, quantity: qty};
                setCart([item]); setView('checkout'); 
              }}
              onAddToCart={(p) => { setCart(prev => [...prev, p]); notify(`Ditambahkan ke Bag.`, "success"); }}
            />
          </div>
        )}

        {view === 'checkout' && cart.length > 0 && (
          <div className="px-4 pt-10"><CheckoutWizard cartItems={cart} rekening={rekening} shippingMethods={shippingMethods} onComplete={() => { setCart([]); setView('shop'); }} onBack={() => setView('cart')} notify={notify} user={user} /></div>
        )}

        {view === 'cart' && (
          <div className="px-4 pt-10"><CartView items={cart} onRemove={(idx) => { const nc = [...cart]; nc.splice(idx,1); setCart(nc); }} onCheckout={() => setView('checkout')} /></div>
        )}

        {view === 'login' && (
          <AdminLogin storeName={storeName} onLoginSuccess={() => { setIsAdminLoggedIn(true); setView('admin'); }} onBack={() => setView('shop')} notify={notify} />
        )}
        
        {view === 'admin' && isAdminLoggedIn && (
          <div className="px-4 pt-10">
            <AdminDashboard 
              storeName={storeName} setStoreName={setStoreName} products={products} orders={orders} rekening={rekening}
              shippingMethods={shippingMethods} onLogout={() => { setIsAdminLoggedIn(false); setView('shop'); }} notify={notify} 
            />
          </div>
        )}
      </main>
      <Footer setView={setView} storeName={storeName} />
    </div>
  );
}

function NotificationItem({ notification }) {
  return (
    <div className="p-4 rounded-2xl shadow-2xl border border-zinc-50 bg-white/90 backdrop-blur-md flex items-center gap-3 animate-in slide-in-from-top-4 pointer-events-auto">
      <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-[#449e48]' : 'bg-red-500'} text-white`}>
        {notification.type === 'success' ? <CheckIcon size={12}/> : <Bell size={12}/>}
      </div>
      <p className="text-[11px] font-bold uppercase tracking-tight">{notification.message}</p>
    </div>
  );
}

function Header({ storeName, cartCount, isAdmin, setView }) {
  return (
    <header className="fixed top-0 left-0 w-full z-[100] bg-white border-b border-zinc-100 h-16 flex items-center px-4">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
        <div className="flex flex-col cursor-pointer group" onClick={() => setView('shop')}>
          <h1 className="text-sm font-black uppercase tracking-[0.3em] leading-none mb-1 group-hover:text-[#449e48] transition-colors">{storeName || 'SHERLY LUXURY'}</h1>
          <div className="h-[2px] w-full bg-zinc-800 group-hover:bg-[#449e48] transition-colors"></div>
        </div>

        <div className="flex items-center gap-2">
            <button onClick={() => setView('cart')} className="relative p-2 text-zinc-600 hover:text-[#449e48] transition-colors">
                <ShoppingBagIcon size={20}/>
                {cartCount > 0 && <span className="absolute top-1 right-1 bg-black text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}
            </button>
            <button onClick={() => isAdmin ? setView('admin') : setView('login')} className="p-2 text-zinc-600 hover:text-[#449e48] transition-colors">
                <Menu size={24}/>
            </button>
        </div>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <div className="relative w-full aspect-[16/7] md:aspect-[16/4.5] bg-zinc-900 overflow-hidden mb-12 rounded-b-[3rem] shadow-xl">
      <img src="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=2000&auto=format&fit=crop" className="w-full h-full object-cover opacity-50" alt="Hero" />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-6">
        <p className="text-[10px] tracking-[0.5em] font-bold uppercase mb-3 opacity-80">Premium Sarimbit Edition</p>
        <h2 className="text-3xl md:text-5xl font-serif italic mb-4">Eternal Grace</h2>
        <div className="h-px w-24 bg-[#449e48] mb-6"></div>
        <p className="text-[9px] md:text-xs max-w-sm opacity-90 leading-relaxed uppercase tracking-[0.2em]">Crafted with dedication, designed for perfection</p>
      </div>
    </div>
  );
}

function ProductGrid({ products, loading, onView, onGoToAdmin }) {
  if (loading) return <div className="py-32 text-center text-zinc-300 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Menghubungkan ke Maison...</div>;
  if (products.length === 0) return (
    <div className="py-32 text-center border-2 border-dashed border-zinc-100 rounded-[3rem] bg-zinc-50/50">
      <PackageSearch size={48} className="text-zinc-200 mx-auto mb-4" />
      <p className="text-[10px] font-bold uppercase text-zinc-300 tracking-widest">Katalog belum tersedia.</p>
      <button onClick={onGoToAdmin} className="text-[10px] font-bold uppercase mt-6 text-[#449e48] underline tracking-widest">Kelola Inventaris</button>
    </div>
  );

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
      {products.map(p => (
        <div key={p.id} className="bg-white rounded-[1.5rem] overflow-hidden flex flex-col group border border-zinc-50 shadow-sm hover:shadow-xl transition-all duration-500" onClick={() => onView(p)}>
          <div className="aspect-[3/4] overflow-hidden bg-zinc-50 relative">
            <img src={p.imageURLs?.[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
          </div>
          <div className="p-5 flex flex-col gap-1 text-center md:text-left">
            <p className="text-sm md:text-lg font-black text-zinc-900 tracking-tight">{formatIDR(p.price)}</p>
            <h3 className="text-[10px] md:text-[11px] text-zinc-400 uppercase font-bold tracking-wider line-clamp-1">{p.name}</h3>
            
            <div className="flex items-center justify-center md:justify-start gap-0.5 mt-2 mb-4">
              {[1,2,3,4,5].map(i => <Star key={i} size={10} className={`${i <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-zinc-200'}`} />)}
              <span className="text-[8px] text-zinc-300 ml-1">(24)</span>
            </div>

            <button className="w-full bg-[#449e48] text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-[0.1em] active:scale-95 transition-all shadow-md shadow-[#449e48]/10 hover:brightness-110">
              Lihat Detil
            </button>
          </div>
        </div>
      ))}
    </section>
  );
}

function ProductDetailView({ product, onBack, onBuy, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState('All Size');
  const [selectedAge, setSelectedAge] = useState('1-2 Thn');
  const [quantity, setQuantity] = useState(1);
  const price = product.sizePrices?.[selectedSize] || product.price;

  return (
    <div className="animate-in fade-in duration-700">
      <button onClick={onBack} className="flex items-center gap-2 text-zinc-400 mb-8 text-[10px] font-bold uppercase tracking-widest hover:text-black transition-colors"><ChevronLeft size={16}/> Kembali ke Katalog</button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 items-start">
        <div className="space-y-4 sticky top-24">
          <div className="aspect-[3/4] bg-zinc-50 rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-2xl">
            <img src={product.imageURLs?.[0]} className="w-full h-full object-cover" alt={product.name} />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            {product.imageURLs?.filter(u => u).map((u, i) => (
              <img key={i} src={u} className="w-20 h-24 object-cover rounded-2xl border-2 border-transparent hover:border-[#449e48] transition-all cursor-pointer bg-zinc-50" />
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tight mb-2 text-zinc-900">{product.name}</h2>
            <p className="text-4xl font-black text-[#449e48] tracking-tighter">{formatIDR(price)}</p>
          </div>

          <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Deskripsi Material</h4>
            <p className="text-sm text-zinc-600 leading-relaxed italic whitespace-pre-wrap">{product.description}</p>
          </div>

          {product.showAgeSelection && (
            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Kategori Umur</label>
              <div className="flex flex-wrap gap-2">
                {AGE_OPTIONS.map(age => (
                  <button key={age} onClick={() => setSelectedAge(age)} className={`px-5 py-3 text-[10px] border-2 rounded-2xl font-bold uppercase transition-all ${selectedAge === age ? 'bg-[#449e48] text-white border-[#449e48] shadow-lg shadow-[#449e48]/20' : 'bg-white border-zinc-100 text-zinc-400'}`}>{age}</button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pilihan Ukuran</label>
            <div className="flex flex-wrap gap-3">
              {SIZE_OPTIONS.map(sz => (
                <button key={sz} onClick={() => setSelectedSize(sz)} className={`w-14 h-14 text-[10px] border-2 rounded-2xl font-bold uppercase transition-all ${selectedSize === sz ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl' : 'bg-white border-zinc-100 text-zinc-400'}`}>{sz}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4 pt-6">
            <button onClick={() => onBuy(selectedSize, selectedAge, price, quantity)} className="bg-[#449e48] text-white py-5 rounded-2xl font-bold text-[12px] tracking-[0.2em] uppercase shadow-2xl shadow-[#449e48]/20 hover:brightness-110 active:scale-95 transition-all">BELI SEKARANG</button>
            <button onClick={() => onAddToCart({...product, chosenSize: selectedSize, chosenAge: selectedAge, chosenPrice: price, quantity})} className="border-2 border-zinc-900 text-zinc-900 py-4 rounded-2xl font-bold text-[11px] tracking-[0.2em] uppercase hover:bg-zinc-900 hover:text-white transition-all">TAMBAH KE KERANJANG</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartView({ items, onRemove, onCheckout }) {
  const total = items.reduce((s, i) => s + (i.chosenPrice || i.price) * (i.quantity || 1), 0);
  return (
    <div className="max-w-3xl mx-auto py-10">
        <h2 className="text-3xl font-black uppercase mb-12 tracking-tighter">My Bag <span className="text-[#449e48]">({items.length})</span></h2>
        {items.length === 0 ? (
          <div className="text-center py-40 bg-zinc-50/50 rounded-[3rem] border-2 border-dashed border-zinc-100">
            <ShoppingBagIcon size={64} className="text-zinc-100 mb-6 mx-auto" />
            <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-widest">Tas belanja Anda kosong.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, idx) => (
              <div key={idx} className="p-6 bg-white border border-zinc-100 rounded-[2rem] flex items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-6 flex-1">
                    <img src={item.imageURLs?.[0]} className="w-20 h-24 rounded-2xl object-cover border border-zinc-100 shadow-sm"/>
                    <div className="space-y-1 flex-1">
                       <h4 className="text-[12px] font-black uppercase text-zinc-900 truncate">{item.name}</h4>
                       <div className="flex gap-2">
                          <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded-md uppercase">{item.chosenSize}</span>
                          <span className="text-[8px] font-bold px-2 py-0.5 bg-zinc-100 rounded-md uppercase">{item.chosenAge}</span>
                       </div>
                       <p className="text-sm font-black text-[#449e48]">{formatIDR(item.chosenPrice || item.price)}</p>
                    </div>
                  </div>
                  <button onClick={()=>onRemove(idx)} className="p-4 text-zinc-200 hover:text-red-500 bg-zinc-50 rounded-2xl border-none cursor-pointer transition-colors border-none bg-transparent"><Trash2 size={20}/></button>
              </div>
            ))}
            <div className="pt-12 mt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="text-center md:text-left">
                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Total Estimasi</p>
                   <p className="text-5xl font-black text-zinc-900 tracking-tighter">{formatIDR(total)}</p>
                </div>
                <button onClick={onCheckout} className="w-full md:w-auto bg-black text-white px-20 py-6 rounded-2xl font-bold uppercase text-[12px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all border-none cursor-pointer">PROCEED TO CHECKOUT <ArrowRight size={20} /></button>
            </div>
          </div>
        )}
    </div>
  );
}

function CheckoutWizard({ cartItems, rekening, shippingMethods, onComplete, onBack, notify, user }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [shipping, setShipping] = useState({ name: '', city: '', address: '', phone: '' });
  const [selectedCourier, setSelectedCourier] = useState(shippingMethods[0]);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.chosenPrice || item.price) * (item.quantity || 1), 0);
  const total = subtotal + (selectedCourier?.price || 0);

  const handleOrder = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const oRef = collection(db, 'artifacts', appId, 'public', 'data', 'orders');
      await addDoc(oRef, { customer: shipping, items: cartItems, courier: selectedCourier, total, status: 'Pending', createdAt: serverTimestamp(), userId: user.uid });
      notify("Pesanan Berhasil Dikirim!", "success");
      setStep(4);
    } catch (e) { notify("Gagal mengirim pesanan", "error"); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-10 rounded-[3rem] border border-zinc-100 shadow-2xl">
      {step < 4 && (
        <div className="flex gap-4 mb-10 text-[9px] font-black uppercase text-zinc-300 border-b pb-6">
          <span className={step >= 1 ? 'text-[#449e48]' : ''}>Logistik</span>
          <ChevronRight size={12}/>
          <span className={step >= 2 ? 'text-[#449e48]' : ''}>Pengiriman</span>
          <ChevronRight size={12}/>
          <span className={step >= 3 ? 'text-[#449e48]' : ''}>Pembayaran</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-left">
          <h3 className="text-sm font-black uppercase mb-6 tracking-widest">Data Penerima</h3>
          <input className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-[11px] uppercase focus:ring-2 focus:ring-[#449e48]/20" placeholder="Nama Lengkap" onChange={e=>setShipping({...shipping, name:e.target.value})}/>
          <input className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-[11px] uppercase focus:ring-2 focus:ring-[#449e48]/20" placeholder="Kota" onChange={e=>setShipping({...shipping, city:e.target.value})}/>
          <input className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none font-bold text-[11px] uppercase focus:ring-2 focus:ring-[#449e48]/20" placeholder="Nomor WA Aktif" onChange={e=>setShipping({...shipping, phone:e.target.value})}/>
          <textarea className="w-full p-5 bg-zinc-50 border border-zinc-100 rounded-2xl outline-none h-24 font-bold text-[11px] uppercase resize-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Alamat Lengkap" onChange={e=>setShipping({...shipping, address:e.target.value})}/>
          <button onClick={()=>setStep(2)} className="w-full bg-[#449e48] text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest mt-6 shadow-xl border-none cursor-pointer">LANJUT KE PENGIRIMAN</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-left">
          <h3 className="text-sm font-black uppercase mb-6 tracking-widest">Opsi Kurir</h3>
          <div className="space-y-3">
            {shippingMethods.map(m => (
              <div key={m.id} onClick={()=>setSelectedCourier(m)} className={`p-5 rounded-2xl border-2 cursor-pointer flex justify-between items-center transition-all ${selectedCourier.id === m.id ? 'border-[#449e48] bg-[#449e48]/5 shadow-inner' : 'border-zinc-50 hover:border-zinc-200'}`}>
                <div className="flex items-center gap-4">
                  <img src={m.logo} className="w-10 h-6 object-contain grayscale opacity-50" alt={m.name} />
                  <span className="font-bold uppercase text-[10px] tracking-widest">{m.name}</span>
                </div>
                <span className="font-black text-xs">{formatIDR(m.price)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 pt-6">
            <button onClick={()=>setStep(1)} className="px-8 py-5 bg-zinc-100 rounded-2xl font-bold uppercase text-[10px] border-none cursor-pointer">Balik</button>
            <button onClick={()=>setStep(3)} className="flex-1 bg-black text-white py-5 rounded-2xl font-bold uppercase text-[10px] border-none cursor-pointer">Lanjut Bayar</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-8 animate-in zoom-in text-center">
           <div className="bg-[#449e48]/5 p-8 rounded-[2.5rem] border-2 border-dashed border-[#449e48]/20">
              <h3 className="text-sm font-black uppercase mb-4 tracking-widest">Informasi Pembayaran</h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase mb-8 leading-relaxed">Pilih salah satu rekening di bawah untuk transfer total:</p>
              <p className="text-3xl font-black text-zinc-900 mb-8">{formatIDR(total)}</p>
              
              <div className="space-y-3 mb-8">
                {rekening.map(rek => (
                  <div key={rek.id} className="p-4 bg-white border border-zinc-100 rounded-2xl text-left">
                    <img src={BANK_LOGOS[rek.bankName]} className="h-5 mb-2" alt={rek.bankName} />
                    <p className="text-[11px] font-black">{rek.accountNumber}</p>
                    <p className="text-[9px] text-zinc-400 uppercase font-bold tracking-widest">{rek.accountHolder}</p>
                  </div>
                ))}
              </div>

              <button onClick={handleOrder} disabled={loading} className="w-full bg-[#449e48] text-white py-5 rounded-2xl font-bold uppercase text-[11px] tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 border-none cursor-pointer">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'KONFIRMASI PESANAN SEKARANG'}
              </button>
           </div>
        </div>
      )}

      {step === 4 && (
        <div className="text-center py-12 animate-in zoom-in">
          <div className="w-20 h-20 bg-[#449e48] text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#449e48]/20"><Check size={32}/></div>
          <h3 className="text-2xl font-black uppercase mb-3 tracking-tighter">Terima Kasih</h3>
          <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-10 max-w-[200px] mx-auto leading-relaxed">Pesanan Anda telah kami terima dan akan segera diproses oleh tim kami.</p>
          <button onClick={onComplete} className="px-12 py-4 bg-zinc-900 text-white rounded-full font-bold uppercase text-[10px] tracking-[0.2em] shadow-xl border-none cursor-pointer">Kembali ke Koleksi</button>
        </div>
      )}
    </div>
  );
}

function AdminDashboard({ storeName, setStoreName, products, orders, rekening, shippingMethods, onLogout, notify }) {
  const [tab, setTab] = useState('inventory');
  const [newStoreName, setNewStoreName] = useState(storeName);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Inventori Form
  const [invForm, setInvForm] = useState({ 
    name: '', price: '', description: '', imageURLs: ['', '', '', '', ''], 
    showAgeSelection: true, 
    sizePrices: { XS: '', S: '', M: '', L: '', XL: '', XXL: '', "All Size": '' } 
  });

  // Bank Form
  const [bankForm, setBankForm] = useState({ bankName: BANK_LIST[0], accountNumber: '', accountHolder: '' });

  // Shipping Form
  const [shipForm, setShipForm] = useState(shippingMethods);
  useEffect(() => { setShipForm(shippingMethods); }, [shippingMethods]);

  const handlePhotoSelect = async (e, idx) => {
    const file = e.target.files[0];
    if (file) {
      const comp = await compressImage(file, 800);
      const nu = [...invForm.imageURLs]; nu[idx] = comp;
      setInvForm({...invForm, imageURLs: nu});
      notify("Foto Siap!");
    }
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...invForm, price: Number(invForm.price), updatedAt: serverTimestamp() };
      if (editingProduct) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', editingProduct.id), data);
        notify("Produk Diperbarui", "success");
      } else {
        data.createdAt = serverTimestamp();
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'products'), data);
        notify("Produk Ditambahkan", "success");
      }
      setShowForm(false);
      setInvForm({ name: '', price: '', description: '', imageURLs: ['', '', '', '', ''], showAgeSelection: true, sizePrices: { XS: '', S: '', M: '', L: '', XL: '', XXL: '', "All Size": '' } });
      setEditingProduct(null);
    } catch (err) { notify("Gagal menyimpan", "error"); } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <aside className="md:w-64 space-y-6">
        <div className="bg-zinc-950 text-white p-8 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-2xl">
          <Crown size={32} className="text-[#449e48]"/>
          <p className="text-[10px] font-black uppercase tracking-[0.4em]">Maison Portal</p>
        </div>
        <nav className="flex flex-col gap-1 p-2 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
          {[
            { id: 'inventory', label: 'Stok Koleksi', icon: PackageSearch },
            { id: 'orders', label: 'Pesanan Masuk', icon: History },
            { id: 'banking', label: 'Metode Bank', icon: CreditCard },
            { id: 'shipping', label: 'Tarif Ongkir', icon: Truck },
            { id: 'settings', label: 'Display Toko', icon: Settings }
          ].map(t => (
            <button key={t.id} onClick={()=>setTab(t.id)} className={`text-left px-5 py-4 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-3 ${tab === t.id ? 'bg-zinc-900 text-white shadow-xl' : 'text-zinc-400 hover:bg-white hover:text-zinc-900'} border-none cursor-pointer bg-transparent`}>
              <t.icon size={16}/> {t.label}
            </button>
          ))}
          <button onClick={onLogout} className="text-left px-5 py-4 text-red-500 text-[10px] font-bold uppercase tracking-widest mt-6 hover:bg-red-50 rounded-2xl transition-all border-none bg-transparent cursor-pointer">Log Out</button>
        </nav>
      </aside>
      
      <div className="flex-1 bg-zinc-50/50 p-10 rounded-[3rem] border border-zinc-100 min-h-[70vh]">
        {tab === 'inventory' && (
          <div className="space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center pb-6 border-b border-zinc-200">
              <h3 className="text-xl font-black uppercase tracking-tighter">Inventori Produk</h3>
              {!showForm && <button onClick={()=>setShowForm(true)} className="bg-[#449e48] text-white px-8 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg border-none cursor-pointer">+ Tambah Model</button>}
            </div>

            {showForm ? (
              <form onSubmit={saveProduct} className="space-y-12 animate-in zoom-in bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-100">
                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Unggah Galeri (HP)</h4>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {invForm.imageURLs.map((u, i) => (
                      <div key={i} className="aspect-square bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[1.5rem] relative flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#449e48]/50">
                        {u ? <img src={u} className="w-full h-full object-cover" alt={`Preview ${i+1}`} /> : <><Plus size={20} className="text-zinc-300"/><span className="text-[7px] font-black text-zinc-300 mt-1 uppercase">Foto {i+1}</span></>}
                        <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e=>handlePhotoSelect(e, i)}/>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Publikasi Maison</h4>
                    <input required className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Judul Katalog" value={invForm.name} onChange={e=>setInvForm({...invForm, name: e.target.value})}/>
                    <input required type="number" className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-bold uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Harga Dasar (IDR)" value={invForm.price} onChange={e=>setInvForm({...invForm, price: e.target.value})}/>
                    
                    <div className="flex justify-between items-center p-5 bg-zinc-50 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-bold uppercase">Pilihan Umur</p>
                        <p className="text-[8px] text-zinc-400 font-bold uppercase">Aktifkan untuk Koleksi Anak</p>
                      </div>
                      <button type="button" onClick={()=>setInvForm({...invForm, showAgeSelection: !invForm.showAgeSelection})} className={`w-12 h-6 rounded-full relative transition-all border-none cursor-pointer ${invForm.showAgeSelection ? 'bg-[#449e48]' : 'bg-zinc-200'}`}>
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${invForm.showAgeSelection ? 'right-1' : 'left-1'}`}/>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Harga per Size (Opsional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {SIZE_OPTIONS.map(sz => (
                        <div key={sz} className="flex items-center bg-zinc-50 rounded-xl px-3 border border-zinc-50">
                          <span className="text-[9px] font-black text-zinc-300 w-10">{sz}</span>
                          <input className="flex-1 p-3 bg-transparent text-[10px] font-bold border-none outline-none" placeholder="IDR" value={invForm.sizePrices[sz] || ''} onChange={e=>setInvForm({...invForm, sizePrices: {...invForm.sizePrices, [sz]: e.target.value}})}/>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <textarea className="w-full p-6 bg-zinc-50 border-none rounded-[2rem] text-[11px] font-bold uppercase h-32 resize-none outline-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Cerita Material..." value={invForm.description} onChange={e=>setInvForm({...invForm, description: e.target.value})}/>
                
                <div className="flex gap-4">
                   <button type="button" onClick={()=>{setShowForm(false); setEditingProduct(null);}} className="px-10 py-5 text-[11px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 transition-colors border-none bg-transparent cursor-pointer">Batal</button>
                   <button disabled={loading} type="submit" className="flex-1 bg-black text-[#449e48] py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 border-none cursor-pointer">
                     {loading ? <Loader2 className="animate-spin" size={16} /> : 'SIMPAN SEKARANG'}
                   </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-zinc-100 space-y-3 relative group shadow-sm hover:shadow-xl transition-all duration-500">
                    <img src={p.imageURLs?.[0]} className="aspect-[3/4] object-cover rounded-2xl w-full" alt={p.name} />
                    <div className="px-2">
                      <p className="text-[10px] font-black truncate uppercase tracking-tighter text-zinc-900">{p.name}</p>
                      <p className="text-[9px] font-bold text-[#449e48] tracking-widest">{formatIDR(p.price)}</p>
                    </div>
                    <div className="flex gap-1 pt-2">
                      <button onClick={()=>{ setEditingProduct(p); setInvForm({...p, imageURLs: p.imageURLs || ['', '', '', '', '']}); setShowForm(true); }} className="flex-1 bg-zinc-50 p-3 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors flex justify-center border-none cursor-pointer"><Edit size={14}/></button>
                      <button onClick={async() => { if(window.confirm('Hapus koleksi ini secara permanen?')) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'products', p.id)); }} className="flex-1 bg-zinc-50 p-3 rounded-xl text-red-200 hover:text-red-500 transition-colors flex justify-center border-none cursor-pointer"><Trash2 size={14}/></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'banking' && (
          <div className="space-y-10 animate-in fade-in max-w-2xl">
            <h3 className="text-xl font-black uppercase tracking-tighter pb-6 border-b">Tambah Rekening / E-Wallet</h3>
            <form onSubmit={async (e) => { 
              e.preventDefault(); setLoading(true); 
              await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rekening'), bankForm); 
              setBankForm({ bankName: BANK_LIST[0], accountNumber: '', accountHolder: '' }); 
              setLoading(false); notify("Metode Ditambahkan", "success"); 
            }} className="space-y-5 bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-50">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Pilih Provider</label>
                <select className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-[#449e48]/20 appearance-none cursor-pointer" value={bankForm.bankName} onChange={e=>setBankForm({...bankForm, bankName: e.target.value})}>
                  {BANK_LIST.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <input required className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Nomor Rekening / ID" value={bankForm.accountNumber} onChange={e=>setBankForm({...bankForm, accountNumber: e.target.value})}/>
              <input required className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-bold uppercase outline-none focus:ring-2 focus:ring-[#449e48]/20" placeholder="Atas Nama" value={bankForm.accountHolder} onChange={e=>setBankForm({...bankForm, accountHolder: e.target.value})}/>
              <button disabled={loading} type="submit" className="w-full bg-black text-[#449e48] py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl mt-4 border-none cursor-pointer">TAMBAH METODE</button>
            </form>
            
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] ml-2">Metode Aktif</h4>
              <div className="grid grid-cols-1 gap-3">
                {rekening.map(rek => (
                  <div key={rek.id} className="p-6 bg-white border border-zinc-100 rounded-[2rem] flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-6">
                      <img src={BANK_LOGOS[rek.bankName]} className="h-6 w-16 object-contain" alt={rek.bankName} />
                      <div>
                        <p className="text-[11px] font-black">{rek.accountNumber}</p>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">{rek.accountHolder}</p>
                      </div>
                    </div>
                    <button onClick={async () => { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rekening', rek.id)); notify('Dihapus', 'success'); }} className="p-4 text-red-200 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"><Trash2 size={20}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'shipping' && (
          <div className="space-y-10 animate-in fade-in max-w-2xl">
            <h3 className="text-xl font-black uppercase tracking-tighter pb-6 border-b">Ubah Tarif Ongkir</h3>
            <div className="space-y-3">
              {shipForm.map((m, idx) => (
                <div key={m.id} className="p-6 bg-white border border-zinc-100 rounded-[2rem] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-6">
                    <img src={m.logo} className="h-6 w-12 object-contain grayscale opacity-50" alt={m.name} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{m.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-zinc-300">RP</span>
                    <input className="w-28 p-3 bg-zinc-50 rounded-xl text-right text-[11px] font-black focus:ring-2 focus:ring-[#449e48]/20 outline-none" type="number" value={m.price} onChange={e=>{const ns=[...shipForm]; ns[idx].price=Number(e.target.value); setShipForm(ns);}}/>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={async () => { setLoading(true); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'shipping'), {methods: shipForm}); setLoading(false); notify("Tarif Diperbarui", "success"); }} disabled={loading} className="w-full bg-black text-[#449e48] py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl border-none cursor-pointer">UPDATE TARIF SEKARANG</button>
          </div>
        )}

        {tab === 'settings' && (
          <div className="max-w-md space-y-10 animate-in fade-in">
            <h3 className="text-xl font-black uppercase tracking-tighter pb-6 border-b">Display Konfigurasi</h3>
            <div className="space-y-6 bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-50">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-2">Nama Portal / Toko</label>
                <input className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[12px] font-black uppercase outline-none focus:ring-2 focus:ring-[#449e48]/20" value={newStoreName} onChange={e=>setNewStoreName(e.target.value)}/>
              </div>
              <button onClick={async() => { setLoading(true); await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', 'config'), {storeName: newStoreName}, {merge:true}); setStoreName(newStoreName); setLoading(false); notify("Tersimpan", "success"); }} disabled={loading} className="w-full bg-black text-[#449e48] py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl border-none cursor-pointer">SINKRONISASI DATA</button>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div className="space-y-8 animate-in fade-in">
            <h3 className="text-xl font-black uppercase tracking-tighter pb-6 border-b">Pesanan Masuk</h3>
            {orders.length === 0 ? <p className="text-[10px] font-black text-zinc-300 uppercase py-32 text-center tracking-[0.5em]">Ledger Kosong</p> : (
              <div className="grid grid-cols-1 gap-4">
                {orders.map(o => (
                  <div key={o.id} className="p-8 bg-white border border-zinc-100 rounded-[2.5rem] flex flex-col md:flex-row justify-between items-center shadow-md">
                    <div className="space-y-2 text-center md:text-left">
                      <p className="text-[12px] font-black uppercase tracking-tight text-zinc-900">{o.customer?.name}</p>
                      <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest flex items-center justify-center md:justify-start gap-2"><MapPin size={12}/> {o.customer?.city} • {o.items?.length} Produk</p>
                    </div>
                    <div className="text-center md:text-right flex flex-col items-center md:items-end gap-2">
                      <p className="text-xl font-black text-[#449e48]">{formatIDR(o.total)}</p>
                      <span className={`text-[8px] px-4 py-1.5 rounded-full uppercase font-black tracking-[0.2em] ${o.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 'bg-[#449e48]/10 text-[#449e48]'}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AdminLogin({ storeName, onLoginSuccess, onBack, notify }) {
  const [u, setU] = useState(''); const [p, setP] = useState('');
  const handleL = (e) => { 
    e.preventDefault(); 
    // FIXED: Case-insensitive check for mobile convenience
    if(u.trim().toLowerCase() === 'admin' && p === '123') { 
      onLoginSuccess(); 
      notify("Akses Diterima", "success"); 
    } else {
      notify("Kredensial Salah", "error"); 
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-white flex items-center justify-center p-6 animate-in zoom-in">
      <div className="w-full max-w-sm space-y-10">
        <button onClick={onBack} className="absolute top-8 right-8 p-3 text-zinc-300 hover:text-black transition-colors border-none bg-transparent cursor-pointer"><X size={28}/></button>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-950 text-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-zinc-900/20 rotate-3 transition-transform hover:rotate-0"><Lock size={32} className="text-[#449e48]"/></div>
          <h3 className="text-lg font-black uppercase tracking-[0.3em]">{storeName || 'ADMIN'} PORTAL</h3>
        </div>
        <form onSubmit={handleL} className="space-y-4">
          {/* FIXED: Added autoCapitalize="none" and autoCorrect="off" for mobile login convenience */}
          <input 
            placeholder="Administrator ID" 
            value={u} 
            onChange={e=>setU(e.target.value)} 
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#449e48]/20"
          />
          <input 
            type="password" 
            placeholder="Secure Pass-Key" 
            value={p} 
            onChange={e=>setP(e.target.value)} 
            className="w-full p-5 bg-zinc-50 border-none rounded-2xl text-[11px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-[#449e48]/20"
          />
          <button type="submit" className="w-full bg-black text-[#449e48] py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl transition-all active:scale-95 border-none cursor-pointer">AUTHORIZE</button>
        </form>
      </div>
    </div>
  );
}

function Footer({ setView, storeName }) {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-24 pb-12 px-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#449e48]/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 relative z-10">
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-[0.4em] text-zinc-900">{storeName || 'MAISON CATALOG'}</h2>
          <p className="text-[11px] text-zinc-400 font-bold uppercase leading-relaxed tracking-widest max-w-sm">
            Maison spesialis modest fashion premium. Kami mengedepankan kualitas jahitan dan material terbaik untuk setiap koleksi sarimbit eksklusif.
          </p>
          <div className="flex gap-4">
            {[Instagram, Facebook, Twitter].map((Icon, i) => (
              <div key={i} className="p-3 bg-zinc-50 rounded-full text-zinc-400 hover:bg-[#449e48] hover:text-white transition-all cursor-pointer">
                <Icon size={18} />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#449e48]">Navigasi</h4>
          <ul className="space-y-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 list-none p-0">
            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Galeri Produk</li>
            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Cara Pemesanan</li>
            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Konfirmasi Bayar</li>
            <li className="hover:text-zinc-900 cursor-pointer transition-colors">Lacak Pesanan</li>
          </ul>
        </div>

        <div className="space-y-6">
          <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#449e48]">Kontak Maison</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <Mail size={16} className="text-[#449e48]"/> concierge@maison-boutique.com
            </div>
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <Phone size={16} className="text-[#449e48]"/> +62 (21) 888-MAISON
            </div>
            <div className="flex items-start gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-400">
              <MapPin size={16} className="text-[#449e48] flex-shrink-0"/> 
              <span>Maison Grande Ave. No. 12<br/>Jakarta Selatan, Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-zinc-50 flex flex-col md:flex-row justify-between items-center gap-8">
        <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.5em]">© 2024 MAISON SYSTEM • ALL RIGHTS RESERVED</p>
        <button onClick={()=>setView('login')} className="flex items-center gap-3 text-zinc-300 text-[9px] font-black uppercase tracking-[0.3em] border border-zinc-100 px-8 py-3 rounded-full hover:bg-zinc-900 hover:text-[#449e48] hover:border-zinc-900 transition-all bg-transparent cursor-pointer">
          <ShieldCheck size={14} /> PORTAL ACCESS
        </button>
      </div>
    </footer>
  );
}
