import { useState, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useAppStore } from '@/src/store/useAppStore';
import { auth, signInWithGoogle } from '@/src/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { HomeScreen } from '@/src/screens/HomeScreen';
import { CreateScreen } from '@/src/screens/CreateScreen';
import { ConfirmScreen } from '@/src/screens/ConfirmScreen';
import { Dashboard } from '@/src/screens/DashboardScreen';
import { PaymentScreen } from '@/src/screens/PaymentScreen';
import { TourScreen } from '@/src/screens/TourScreen';
import { ShieldCheck, LogIn, Sun, Moon, RotateCcw } from 'lucide-react';

type Page = 'home' | 'create' | 'confirm' | 'dashboard' | 'payment' | 'tour';

export default function App() {
  const { tontineCreated, contractConfirmed, paymentDone, isDarkMode, toggleTheme, resetApp, user, setUser } = useAppStore();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [toast, setToast] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (userData) => {
      setUser(userData);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, [setUser]);

  const handleNavigate = (page: string) => {
    if (!user && page !== 'home') {
      showToast("🔒 Veuillez vous connecter d'abord");
      return;
    }
    // Navigation locks
    if (page === 'confirm' && !tontineCreated) {
      showToast("🔒 Créez votre tontine d'abord");
      return;
    }
    if ((page === 'dashboard' || page === 'payment') && !contractConfirmed) {
      showToast("🔒 Confirmez votre contrat d'abord");
      return;
    }
    if (page === 'tour' && !paymentDone) {
      showToast("🔒 Effectuez votre paiement d'abord");
      return;
    }

    setCurrentPage(page as Page);
    window.scrollTo(0, 0);
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      showToast("❌ Échec de la connexion");
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
        <div className="max-w-[450px] mx-auto min-h-screen bg-bg-main flex flex-col items-center justify-center p-10 text-center shadow-2xl">
          <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 border border-primary/30">
            <ShieldCheck className="text-primary size-12" />
          </div>
          <h1 className="text-3xl font-black mb-4">TontineChain</h1>
          <p className="text-text-muted mb-10">La tontine africaine, sécurisée par la blockchain Celo.</p>
          <button 
            onClick={handleLogin}
            className="w-full py-4 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all"
          >
            <LogIn size={20} /> Se connecter avec Google
          </button>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomeScreen onNavigate={handleNavigate} />;
      case 'create': return <CreateScreen onNavigate={handleNavigate} />;
      case 'confirm': return <ConfirmScreen onNavigate={handleNavigate} />;
      case 'dashboard': return <Dashboard onNavigate={handleNavigate} />;
      case 'payment': return <PaymentScreen onNavigate={handleNavigate} />;
      case 'tour': return <TourScreen onNavigate={handleNavigate} />;
      default: return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark' : ''}`}>
      <div className="max-w-[450px] mx-auto min-h-screen bg-bg-main shadow-2xl relative">
        
        {/* Top Control Bar */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
            <button 
                onClick={toggleTheme}
                className="bg-bg-card border border-border-main p-2 rounded-full shadow-lg hover:scale-110 transition-all text-text-main"
                title={isDarkMode ? 'Mode Clair' : 'Mode Sombre'}
            >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button 
                onClick={() => { if(confirm('Réinitialiser pour la démo ?')) resetApp(); }}
                className="bg-bg-card border border-border-main p-2 rounded-full shadow-lg hover:scale-110 transition-all text-text-muted hover:text-danger"
                title="Reset local data"
            >
                <RotateCcw size={18} />
            </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>

        {/* Global Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="fixed bottom-10 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl z-50 pointer-events-none shadow-2xl border-primary/20"
            >
              <p className="text-primary font-bold text-sm">{toast}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
