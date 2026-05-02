import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, RoundState } from '@/src/store/useAppStore';
import { ActionButton, StatusPill, ProgressBar } from '@/src/components/UI';
import { formatFCFA, cn } from '@/src/lib/utils';
import { ChevronLeft, Info, Send, ShieldCheck, AlertTriangle, PartyPopper, Cpu } from 'lucide-react';

export function TourScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { tontine, roundState, setRoundState, currentRound, advanceRound } = useAppStore();
  const [showToast, setShowToast] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);

  if (!tontine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-muted">Synchronisation avec le smart contract...</p>
      </div>
    );
  }

  const beneficiary = tontine.membres[(currentRound - 1) % tontine.membres.length];
  const potTotal = tontine.montant * tontine.membres.length;
  const paidCount = tontine.membres.filter(m => m.paidInCurrentRound).length;
  const progressPercent = (paidCount / tontine.membres.length) * 100;

  const handleAdvance = async () => {
    setIsReleasing(true);
    await advanceRound();
    setIsReleasing(false);
    onNavigate('dashboard');
  };

  const simulateTransition = (next: RoundState) => {
    setRoundState(next);
    if (next === 'tous-payés') {
      setTimeout(() => setRoundState('libéré'), 2500);
    }
  };

  const getStatusText = () => {
    switch (roundState) {
      case 'en-cours': return 'En cours';
      case 'retardataire': return 'En attente';
      case 'tous-payés': return 'Prêt';
      case 'libéré': return 'Libéré ✓';
      default: return 'En cours';
    }
  };

  if (isReleasing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(212,169,32,0.3)]"
        >
          <Send className="text-bg-dark size-10" />
        </motion.div>
        <h2 className="text-2xl font-black text-primary mb-2">Libération on-chain...</h2>
        <p className="text-text-muted text-sm px-4">Le smart contract déverrouille les fonds pour {beneficiary.nom}.</p>
        
        <div className="mt-10 w-full glass p-4 rounded-xl font-mono text-[9px] text-forest space-y-1 text-left">
           <p>&gt; Calling releasePot()...</p>
           <p>&gt; Beneficiary: {beneficiary.id}</p>
           <p>&gt; Amount: {potTotal} FCFA</p>
           <p className="animate-pulse">&gt; tx: 0x{Array(32).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')}...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-main text-text-main transition-colors duration-300">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-bg-main/80 backdrop-blur-md z-10 border-b border-border-main">
        <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-text-muted"><ChevronLeft /></button>
        <div className="text-center">
            <h1 className="text-sm font-black uppercase tracking-widest text-text-muted">Tour {currentRound} / {tontine.membres.length}</h1>
            <p className="font-bold text-primary truncate max-w-[150px]">{tontine.nom}</p>
        </div>
        <StatusPill status={getStatusText()} />
      </header>

      <main className="p-6 space-y-8 flex-1 pb-32">
        <div className="glass p-3 rounded-2xl flex gap-2">
            <button onClick={() => simulateTransition('en-cours')} className="flex-1 text-[10px] font-bold py-2 bg-bg-card border border-border-main rounded-lg active:bg-primary/20 transition-colors">En cours</button>
            <button onClick={() => simulateTransition('retardataire')} className="flex-1 text-[10px] font-bold py-2 bg-bg-card border border-border-main rounded-lg active:bg-danger/20 transition-colors">Retard</button>
            <button onClick={() => simulateTransition('tous-payés')} className="flex-1 text-[10px] font-bold py-2 bg-bg-card border border-border-main rounded-lg active:bg-forest/20 transition-colors">Payés</button>
        </div>

        <div className="glass p-6 rounded-[32px] space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-black border-4 border-forest/10">
                    {beneficiary.initials}
                </div>
                <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Bénéficiaire</p>
                    <p className="text-xl font-black text-text-main">{beneficiary.nom}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                    <span className="text-text-muted">Réception attendue</span>
                    <span className="text-primary">{formatFCFA(potTotal)}</span>
                </div>
                <ProgressBar progress={progressPercent} />
                <p className="text-[10px] text-right font-bold text-text-muted">
                    {paidCount} / {tontine.membres.length} payés
                </p>
            </div>
        </div>

        <AnimatePresence mode="wait">
            {roundState === 'libéré' ? (
                <motion.div 
                    key="libere"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-forest/20 border-2 border-forest/40 p-6 rounded-[32px] text-center space-y-4 shadow-[0_0_50px_rgba(26,94,64,0.3)]"
                >
                    <div className="inline-flex w-16 h-16 bg-forest rounded-full items-center justify-center mb-2">
                        <PartyPopper size={32} className="text-primary" />
                    </div>
                    <h3 className="text-2xl font-black text-primary uppercase tracking-tight">Cagnotte Libérée !</h3>
                    <p className="text-4xl font-black text-text-main tracking-tighter">{formatFCFA(potTotal)}</p>
                    <div className="glass p-3 rounded-xl border-border-main">
                        <p className="text-[9px] font-mono text-forest truncate uppercase font-bold tracking-tighter">Verified transaction confirmed on block</p>
                    </div>
                </motion.div>
            ) : roundState === 'retardataire' ? (
                <motion.div 
                    key="retard"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-danger/10 border-2 border-danger/30 p-6 rounded-[32px] space-y-4"
                >
                    <div className="flex items-center gap-3">
                        <AlertTriangle className="text-danger" size={24} />
                        <h3 className="font-black text-danger uppercase tracking-widest text-sm">Libération bloquée</h3>
                    </div>
                    <div className="flex items-center justify-between bg-bg-card p-4 rounded-2xl border border-border-main">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-bg-card border border-border-main rounded-full flex items-center justify-center font-bold text-xs">SM</div>
                            <div>
                                <p className="font-bold text-sm text-text-main">Sophie Mensan</p>
                                <p className="text-[10px] text-danger font-bold uppercase tracking-tight">Paiement manquant</p>
                            </div>
                        </div>
                        <button 
                          onClick={() => {
                            setShowToast(true);
                            setTimeout(() => setShowToast(false), 3000);
                          }}
                          className="bg-primary p-2 rounded-lg text-white shadow-lg active:scale-95 transition-transform"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </motion.div>
            ) : roundState === 'tous-payés' ? (
                <motion.div 
                    key="processing"
                    className="glass p-8 rounded-[32px] flex flex-col items-center gap-4 text-center border-forest/30"
                >
                    <div className="relative">
                      <ShieldCheck className="text-forest size-12" />
                      <div className="absolute -inset-2 bg-forest/20 rounded-full blur-xl animate-pulse" />
                    </div>
                    <p className="text-lg font-black text-primary uppercase tracking-widest">Paiements Validés</p>
                    <p className="text-xs text-text-muted">En attente de la libération contractuelle...</p>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                className="w-2 h-2 rounded-full bg-primary"
                            />
                        ))}
                    </div>
                </motion.div>
            ) : (
                <div className="glass p-6 rounded-[32px] flex items-center gap-4">
                    <Info className="text-text-muted size-5 shrink-0" />
                    <p className="text-xs text-text-muted font-medium italic leading-relaxed">
                        Le Smart Contract libérera automatiquement les fonds dès que les <span className="text-primary font-bold">{tontine.membres.length}</span> membres auront validé leur tour.
                    </p>
                </div>
            )}
        </AnimatePresence>

        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs uppercase font-black text-text-muted tracking-widest">Membres ({tontine.membres.length})</h2>
              <StatusPill status={`${paidCount}/${tontine.membres.length} validé`} />
            </div>
            <div className="space-y-3">
                {tontine.membres.map((m) => (
                    <div key={m.id} className={cn(
                        "flex items-center justify-between p-4 glass rounded-2xl border-l-4 transition-all duration-300",
                        m.paidInCurrentRound ? "border-l-forest scale-[1.02] shadow-lg" : "border-l-border-main"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-bg-card rounded-full flex items-center justify-center font-bold text-xs tracking-tighter border border-border-main shadow-sm">
                                {m.initials}
                            </div>
                            <p className="font-bold text-sm text-text-main">{m.nom} {m.nom === 'Moi' ? '(Vous)' : ''}</p>
                        </div>
                        <StatusPill 
                            status={m.paidInCurrentRound ? 'Confirmé' : 'En attente'} 
                        />
                    </div>
                ))}
            </div>
        </div>
      </main>

      {showToast && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-32 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl z-50 text-white font-bold text-xs bg-forest shadow-2xl flex items-center gap-2 border border-primary/20"
        >
          <Send size={14} /> Relance WhatsApp envoyée ! 📲
        </motion.div>
      )}

      {/* Navigation Dummy for Tour Screen */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] glass border-t border-border-main p-4 pb-8 flex gap-4 bg-bg-card/90 backdrop-blur-xl z-30">
          {roundState === 'libéré' ? (
              <ActionButton onClick={handleAdvance} variant="primary" className="flex-1 py-4 text-sm uppercase tracking-widest">
                  Valider & Nouveau Tour
              </ActionButton>
          ) : (
              <ActionButton 
                onClick={() => onNavigate('payment')} 
                variant="primary" 
                className="flex-1 py-4 text-sm uppercase tracking-widest disabled:opacity-50"
                disabled={tontine.membres.find(m => m.nom === 'Moi')?.paidInCurrentRound}
              >
                  {tontine.membres.find(m => m.nom === 'Moi')?.paidInCurrentRound ? 'Cotisation Validée ✓' : 'Approuver & Payer'}
              </ActionButton>
          )}
      </div>
    </div>
  );
}
