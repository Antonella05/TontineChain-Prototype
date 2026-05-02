import { useState } from 'react';
import { useAppStore } from '@/src/store/useAppStore';
import { formatFCFA, cn } from '@/src/lib/utils';
import { StatusPill, ProgressBar } from '@/src/components/UI';
import { motion } from 'motion/react';
import { 
  Plus, 
  ChevronRight, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  Bell,
  LayoutDashboard,
  Wallet,
  Settings,
  Sun,
  Moon,
  ShieldCheck,
  Cpu,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';

export function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { user, tontine, currentRound, transactions, isDarkMode, toggleTheme, celoBalance, contractAddress, resetApp, markAsLate } = useAppStore();
  const [activeTab, setActiveTab] = useState<'dash' | 'wallet' | 'history' | 'settings'>('dash');
  const [showIncidentAction, setShowIncidentAction] = useState(false);
  const [confirmIncident, setConfirmIncident] = useState(false);

  if (!tontine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-muted">Récupération des données du dashboard...</p>
      </div>
    );
  }

  const beneficiary = tontine.membres[(currentRound - 1) % tontine.membres.length];
  const paidCount = tontine.membres.filter(m => m.paidInCurrentRound).length;
  const missingCount = tontine.membres.length - paidCount;
  const progressPercent = (paidCount / tontine.membres.length) * 100;
  const isMyTurnToPay = !tontine.membres.find(m => m.id === user?.uid || m.nom === (user?.displayName || 'Moi'))?.paidInCurrentRound;
  const totalPot = tontine.montant * tontine.membres.length;
  const penaltyTotal = tontine.roundState === 'retardataire' ? missingCount * (tontine.penalite || 0) : 0;
  const netPot = totalPot - (tontine.frais || 0) + penaltyTotal;
  const myName = user?.displayName || 'Moi';
  const isCreator = user?.uid === tontine.creatorId;

  const renderContent = () => {
    switch (activeTab) {
      case 'history':
        return (
          <div className="space-y-6">
            <header>
              <h2 className="text-3xl font-black">Historique</h2>
              <p className="text-text-muted">Toutes vos transactions on-chain</p>
            </header>
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="glass p-10 text-center rounded-3xl opacity-50">
                  <Clock className="mx-auto mb-4" size={40} />
                  <p>Aucune transaction pour le moment</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 glass rounded-xl border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        tx.type === 'contribution' ? "bg-primary/10 text-primary" : "bg-forest/10 text-forest"
                      )}>
                        {tx.type === 'contribution' ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold capitalize">{tx.type === 'contribution' ? "Contribution" : "Reception"}</p>
                        <p className="text-[8px] font-mono text-text-muted truncate w-32">{tx.txHash}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-bold text-sm", tx.type === 'contribution' ? "text-danger" : "text-primary")}>
                        {tx.type === 'contribution' ? "-" : "+"}{formatFCFA(tx.amount)}
                      </p>
                      <p className="text-[8px] text-text-muted font-bold">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black">Réglages</h2>
              <p className="text-text-muted">Configuration de votre compte</p>
            </header>
            <div className="space-y-4">
              <div className="glass p-6 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">Thème Sombre</p>
                    <p className="text-xs text-text-muted">Activer/Désactiver le mode nuit</p>
                  </div>
                  <button onClick={toggleTheme} className="w-12 h-6 bg-white/10 rounded-full relative p-1 transition-colors border border-white/10">
                    <motion.div 
                      animate={{ x: isDarkMode ? 24 : 0 }}
                      className="w-4 h-4 bg-primary rounded-full shadow-lg"
                    />
                  </button>
                </div>
                <div className="pt-4 border-t border-border-main flex items-center justify-between">
                  <div>
                    <p className="font-bold">Notifications</p>
                    <p className="text-xs text-text-muted">Relances et alertes de pot</p>
                  </div>
                  <div className="w-12 h-6 bg-forest/20 rounded-full border border-forest/30 flex items-center justify-end p-1">
                    <div className="w-4 h-4 bg-forest rounded-full" />
                  </div>
                </div>
              </div>

              <div className="glass p-6 rounded-3xl space-y-4 border-danger/20">
                <h3 className="text-xs font-black uppercase text-danger tracking-widest">Zone de danger</h3>
                <p className="text-xs text-text-muted">Réinitialiser l'application supprimera vos données locales mais pas vos contrats on-chain.</p>
                <button 
                  onClick={() => { if(confirm('Réinitialiser ?')) resetApp(); }}
                  className="w-full py-3 bg-danger/10 text-danger font-bold rounded-xl border border-danger/20"
                >
                  Réinitialiser l'App
                </button>
              </div>
            </div>
          </div>
        );
      case 'wallet':
        return (
          <div className="space-y-8">
            <header>
              <h2 className="text-3xl font-black">Portefeuille</h2>
              <p className="text-text-muted">Actifs sur le réseau Celo</p>
            </header>
            <div className="glass card-active p-8 rounded-[40px] text-center space-y-4 bg-radial-gradient from-primary/10 to-transparent">
               <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-primary/30">
                  <Wallet className="text-primary" size={40} />
               </div>
               <p className="text-4xl font-black text-text-main">{celoBalance.toFixed(4)} <span className="text-sm font-bold text-primary">CELO</span></p>
               <p className="text-[10px] font-mono text-forest bg-bg-card p-2 rounded-lg truncate border border-border-main">{contractAddress}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button className="glass p-4 rounded-2xl flex flex-col items-center gap-2">
                <ArrowUpRight className="text-primary" />
                <span className="text-xs font-bold uppercase">Envoyer</span>
              </button>
              <button className="glass p-4 rounded-2xl flex flex-col items-center gap-2">
                <ArrowDownLeft className="text-forest" />
                <span className="text-xs font-bold uppercase">Recevoir</span>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <header className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-black">Dashboard</h2>
                <p className="text-text-muted">Bienvenue, <span className="text-primary font-bold italic">{user?.displayName || 'Utilisateur'}</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black text-text-muted tracking-widest mb-1">Solde CELO</p>
                <p className="text-xl font-black text-text-main">{celoBalance.toFixed(3)} CELO</p>
              </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-2xl border-forest">
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Net à percevoir</p>
                <div className="flex flex-col">
                  <p className="text-xl font-black text-primary">{formatFCFA(netPot)}</p>
                  <p className="text-[9px] text-text-muted font-bold line-through opacity-50">Base: {formatFCFA(totalPot - (tontine.frais || 0))}</p>
                </div>
                <div className="mt-2 flex items-center gap-1 text-[8px] text-forest font-bold uppercase tracking-tighter">
                  <ShieldCheck size={10} /> {penaltyTotal > 0 ? `Pénalités incluses: +${formatFCFA(penaltyTotal)}` : `Précision Smart Contract`}
                </div>
              </div>
              <div className="glass-muted p-4 rounded-2xl">
                <p className="text-text-muted text-[10px] uppercase font-bold tracking-wider mb-1">Membres Actifs</p>
                <p className="text-xl font-black">{tontine.membres.length}</p>
                <div className="mt-2 h-1 w-full bg-bg-main rounded-full overflow-hidden">
                   <div className="h-full bg-primary w-[75%]"></div>
                </div>
              </div>
            </div>

            {/* Main Tontine Card */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="relative glass card-active p-6 rounded-[24px] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary opacity-[0.03] rounded-full translate-x-1/2 -translate-y-1/2"></div>
              <div className="relative z-10 space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-[8px] font-black px-2 py-0.5 rounded-full uppercase",
                        tontine.roundState === 'retardataire' ? "bg-danger text-white animate-pulse" : "bg-primary/20 text-primary"
                      )}>
                        {tontine.roundState === 'retardataire' ? '⚠️ Incident de paiement' : 'Tontine Active'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[8px] font-mono text-text-muted">
                      <Cpu size={10} /> {contractAddress.slice(0, 10)}...
                    </div>
                  </div>
                  <h3 className="text-lg font-black truncate">{tontine.nom}</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-text-muted text-[8px] uppercase tracking-widest font-black">Cotisation</p>
                      <p className="text-sm font-bold">{formatFCFA(tontine.montant)}</p>
                   </div>
                   <div>
                      <p className="text-text-muted text-[8px] uppercase tracking-widest font-black">Prochain Tour</p>
                      <p className="text-sm font-bold">À la clôture du tour</p>
                   </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between text-[10px] font-bold mb-1">
                    <span className="text-text-muted">Collecte du tour</span>
                    <span className="text-forest">{paidCount}/{tontine.membres.length} Payés</span>
                  </div>
                  <ProgressBar progress={progressPercent} />
                </div>
              </div>
            </motion.div>

            {/* Contribution CTA */}
            {isMyTurnToPay && (
              <motion.div 
                whileTap={{ scale: 0.98 }}
                className="bg-primary p-5 rounded-2xl flex items-center justify-between shadow-[0_10px_20px_-5px_rgba(212,169,32,0.3)] cursor-pointer"
                onClick={() => onNavigate('payment')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-bg-dark/10 rounded-xl flex items-center justify-center">
                    <Wallet className="text-bg-dark" />
                  </div>
                  <div>
                    <p className="text-bg-dark font-black">C'est votre tour !</p>
                    <p className="text-bg-dark/60 text-xs font-bold font-mono uppercase tracking-tighter">Due : {formatFCFA(tontine.montant + (tontine.roundState === 'retardataire' ? (tontine.penalite || 0) : 0))}</p>
                    {tontine.roundState === 'retardataire' && <p className="text-[8px] text-danger font-black uppercase">Pénalité incluse</p>}
                  </div>
                </div>
                <ChevronRight className="text-bg-dark" />
              </motion.div>
            )}

            {/* Admin Actions: Incident Management */}
            {isCreator && tontine.roundState !== 'retardataire' && paidCount < tontine.membres.length && (
              <div className="pt-4">
                <button 
                  onClick={() => setShowIncidentAction(!showIncidentAction)}
                  className="w-full py-4 border-2 border-rose-500/20 text-rose-500 font-black rounded-2xl flex items-center justify-center gap-3 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                >
                  <ShieldAlert size={20} />
                  SIGNALER UN INCIDENT
                </button>
                
                {showIncidentAction && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 p-5 glass border-rose-500/30 rounded-2xl space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center shrink-0">
                        <AlertTriangle className="text-rose-500" size={20} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-bold">Action irréversible</p>
                        <p className="text-[10px] text-text-muted">Déclarer un incident appliquera une pénalité de {formatFCFA(tontine.penalite || 0)} à tous les membres n'ayant pas encore payé.</p>
                      </div>
                    </div>
                    {!confirmIncident ? (
                      <button 
                        onClick={() => setConfirmIncident(true)}
                        className="w-full py-3 bg-rose-500 text-white font-black rounded-xl"
                      >
                        APPLIQUER LES PÉNALITÉS
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => setConfirmIncident(false)}
                          className="flex-1 py-3 bg-bg-card border-2 border-rose-500/20 text-rose-500 font-bold rounded-xl"
                        >
                          ANNULER
                        </button>
                        <button 
                          onClick={() => {
                            markAsLate();
                            setShowIncidentAction(false);
                            setConfirmIncident(false);
                          }}
                          className="flex-[2] py-3 bg-rose-500 text-white font-black rounded-xl animate-pulse"
                        >
                          OUI, APPLIQUER
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {/* Beneficiary */}
            <div className="space-y-4">
              <h2 className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Bénéficiaire du tour</h2>
              <div className="glass p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 bg-forest/30 rounded-full flex items-center justify-center text-primary font-black text-xl border-2 border-primary/30">
                  {beneficiary.initials}
                </div>
                <div>
                  <p className="font-bold text-text-main">{beneficiary.nom} {beneficiary.nom === myName ? '(Vous)' : ''}</p>
                  <p className="text-xs text-text-muted font-medium">Libération prévue à la fin du tour</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      {/* Header */}
      <header className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-bg-main rounded-full flex items-center justify-center font-black">
            {tontine.nom[0]}
          </div>
          <div>
            <h1 className="font-black text-lg truncate w-40">TontineChain</h1>
            <p className="text-[10px] text-forest font-bold uppercase tracking-widest">Actif: {tontine.nom}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="p-2 glass rounded-full text-text-muted relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 pb-32">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[450px] glass border-t border-border-main safe-area-bottom z-40 bg-bg-card/80 backdrop-blur-xl">
        <div className="flex items-center justify-around py-4">
          <button 
            onClick={() => setActiveTab('dash')}
            className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'dash' ? "text-primary scale-110" : "text-text-muted")}
          >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold">Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('wallet')}
            className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'wallet' ? "text-primary scale-110" : "text-text-muted")}
          >
            <Wallet size={24} />
            <span className="text-[10px] font-bold">Portefeuille</span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'history' ? "text-primary scale-110" : "text-text-muted")}
          >
            <Clock size={24} />
            <span className="text-[10px] font-bold">Historique</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'settings' ? "text-primary scale-110" : "text-text-muted")}
          >
             <Settings size={24} />
             <span className="text-[10px] font-bold">Réglages</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

