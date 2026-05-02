import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '@/src/store/useAppStore';
import { ActionButton } from '@/src/components/UI';
import { logout } from '@/src/lib/firebase';
import { ShieldCheck, Users, Trophy, ChevronRight, Info, LogOut, User, X, Search } from 'lucide-react';

export function HomeScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, setUser, joinTontine } = useAppStore();
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [tontineId, setTontineId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  const handleJoin = async () => {
    if (!tontineId) return;
    setIsLoading(true);
    setError('');
    try {
      await joinTontine(tontineId);
      setIsJoinModalOpen(false);
      onNavigate('dashboard');
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const platformHighlights = [
    { label: 'Blockchain', value: 'Sécurisé' },
    { label: 'Paiements', value: 'Mobile' },
    { label: 'Règles', value: 'Transparent' },
  ];

  const steps = [
    { title: 'Créez', desc: 'Définissez vos règles et montant' },
    { title: 'Invitez', desc: 'Ajoutez les membres de confiance' },
    { title: 'Payez', desc: 'Cotisez via Mobile Money' },
    { title: 'Recevez', desc: 'La cagnotte est libérée automatiquement' },
  ];

  return (
    <div className="flex flex-col min-h-screen pagne-pattern pb-20">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || ''} className="w-10 h-10 rounded-full border-2 border-primary" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center border-2 border-primary">
              <User className="text-primary size-5" />
            </div>
          )}
          <div className="text-left">
            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest leading-none">Connecté en tant que</p>
            <p className="font-black text-xs text-text-main">{user?.displayName || user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 glass rounded-full text-text-muted hover:text-danger transition-colors"
        >
          <LogOut size={18} />
        </button>
      </header>

      <div className="flex flex-col items-center gap-4 px-6 pt-4">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-primary rounded-[20px] flex items-center justify-center shadow-lg transform rotate-3"
        >
          <span className="text-white font-display font-black text-3xl -rotate-3">TC</span>
        </motion.div>
        
        <div className="flex items-center gap-2 bg-bg-card/50 py-1 px-3 rounded-full border border-border-main">
          <motion.div 
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-forest shadow-[0_0_8px_rgba(26,94,64,0.4)]"
          />
          <span className="text-[10px] uppercase font-bold tracking-widest text-text-muted">
            Propulsé par Celo Blockchain
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="px-6 py-8 text-center">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl leading-tight font-black mb-6"
        >
          La tontine de <span className="text-primary">confiance</span>, sans frontières
        </motion.h1>

        <div className="grid grid-cols-3 gap-2 mb-10">
          {platformHighlights.map((highlight, i) => (
            <div key={i} className="glass p-3 rounded-2xl">
              <p className="text-[9px] text-text-muted mb-1 uppercase font-bold tracking-tighter">{highlight.label}</p>
              <p className="text-sm font-black text-primary">{highlight.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <ActionButton onClick={() => onNavigate('create')} className="w-full text-lg py-5">
            Créer une tontine <ChevronRight className="ml-2" />
          </ActionButton>
          <ActionButton onClick={() => setIsJoinModalOpen(true)} variant="outline" className="w-full">
            Rejoindre une tontine
          </ActionButton>
        </div>

        {/* Join Modal */}
        <AnimatePresence>
          {isJoinModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsJoinModalOpen(false)}
                className="absolute inset-0 bg-bg-dark/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-md bg-bg-card border-2 border-border-main p-8 rounded-[32px] shadow-2xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4">
                  <button onClick={() => setIsJoinModalOpen(false)} className="p-2 text-text-muted hover:text-primary transition-colors">
                    <X size={24} />
                  </button>
                </div>

                <div className="flex flex-col items-center gap-6">
                  <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                    <Search size={32} />
                  </div>
                  
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-text-main">Rejoindre une Tontine</h3>
                    <p className="text-sm text-text-muted">Entrez l'identifiant unique communiqué par le créateur.</p>
                  </div>

                  <div className="w-full space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-text-muted tracking-widest pl-2">ID de la tontine</label>
                      <input 
                        type="text"
                        value={tontineId}
                        onChange={(e) => setTontineId(e.target.value)}
                        placeholder="Ex: a1b2c3d4"
                        className="w-full bg-bg-dark border-2 border-border-main rounded-xl px-5 py-4 focus:border-primary focus:outline-none text-text-main font-mono text-center uppercase tracking-widest"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-danger text-center font-bold">{error}</p>
                    )}

                    <ActionButton 
                      onClick={handleJoin} 
                      disabled={!tontineId || isLoading}
                      className="w-full py-4 text-base"
                    >
                      {isLoading ? 'Recherche en cours...' : 'Rejoindre'}
                    </ActionButton>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* How it works */}
      <section className="px-6 py-10 bg-bg-card/30">
        <h2 className="text-xl mb-8 text-center flex items-center justify-center gap-2 text-text-main">
          <Info className="text-primary size-5" /> Comment ça marche ?
        </h2>
        
        <div className="relative space-y-12">
          {/* Connecting Line */}
          <div className="absolute left-6 top-8 bottom-8 w-[1px] bg-primary/20" />
          
          {steps.map((step, i) => (
            <motion.div 
              key={i}
              initial={{ x: -20, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative pl-14"
            >
              <div className="absolute left-0 top-0 w-12 h-12 rounded-xl bg-forest border-2 border-primary/30 flex items-center justify-center z-10">
                <span className="text-primary font-black">{i + 1}</span>
              </div>
              <h3 className="text-lg font-bold text-primary">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto p-10 text-center flex flex-col items-center gap-6">
        <div className="flex gap-4">
          <span className="text-[10px] text-text-muted uppercase tracking-widest border-b border-white/5 pb-1">Mentions Légales</span>
          <span className="text-[10px] text-text-muted uppercase tracking-widest border-b border-white/5 pb-1">Contact</span>
        </div>
        <p className="text-[10px] text-white/20">© 2026 TontineChain. Tous droits réservés.</p>
      </footer>
    </div>
  );
}
