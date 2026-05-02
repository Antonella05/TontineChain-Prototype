import { motion } from 'motion/react';
import { useAppStore } from '@/src/store/useAppStore';
import { ActionButton, StatusPill } from '@/src/components/UI';
import { formatFCFA } from '@/src/lib/utils';
import { CheckCircle2, Copy, Share2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

export function ConfirmScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { tontine, contractAddress, confirmContract } = useAppStore();
  const [copied, setCopied] = useState(false);

  if (!tontine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-muted">Chargement des détails du contrat...</p>
      </div>
    );
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const text = `Rejoins ma tontine blockchain "${tontine.nom}" sur TontineChain ! Montant: ${formatFCFA(tontine.montant)} / ${tontine.freq}. Adresse: ${contractAddress}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 bg-bg-main pagne-pattern">
      <div className="flex flex-col items-center text-center mt-12 mb-10">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          className="w-20 h-20 bg-forest rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(26,94,64,0.3)]"
        >
          <CheckCircle2 className="text-primary size-10" />
        </motion.div>
        <h1 className="text-3xl font-black text-text-main mb-2">Contrat Déployé !</h1>
        <p className="text-text-muted">Votre tontine est désormais publique et immuable sur Celo.</p>
      </div>

      <div className="glass p-6 rounded-[24px] border-border-main space-y-6 mb-8 bg-bg-card">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-primary tracking-widest">Adresse du Smart Contract</label>
          <div className="flex items-center gap-3 bg-bg-main rounded-xl p-3 border border-border-main">
            <span className="flex-1 font-mono text-[10px] truncate text-forest">{contractAddress}</span>
            <button onClick={copyToClipboard} className="text-primary p-1">
              <Copy size={16} />
            </button>
          </div>
          {copied && <p className="text-[10px] text-primary text-center">Copié dans le presse-papier !</p>}
        </div>

        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border-main">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-text-muted">Nom</p>
            <p className="font-bold text-sm truncate">{tontine.nom}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-text-muted">Cotisation</p>
            <p className="font-bold text-sm text-primary">{formatFCFA(tontine.montant)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-text-muted">Fréquence</p>
            <p className="font-bold text-sm capitalize">{tontine.freq}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-text-muted">Membres</p>
            <div className="flex items-center gap-1">
               <p className="font-bold text-sm">{tontine.membres.length}</p>
               <span className="text-[10px] text-text-muted font-medium">Validés ✓</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-center text-xs font-bold text-text-muted mb-4 uppercase tracking-tighter">Partager l'invitation</p>
        <div className="flex gap-4">
          <button 
            onClick={shareOnWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg"
          >
            <MessageCircle size={20} /> WhatsApp
          </button>
          <button 
            onClick={() => {}}
            className="flex-1 flex items-center justify-center gap-2 bg-bg-card border border-border-main text-text-main py-4 rounded-xl font-bold active:scale-95 transition-all shadow-sm"
          >
            <Share2 size={20} /> Autre
          </button>
        </div>
      </div>

      <div className="mt-auto pt-10">
        <ActionButton 
          onClick={() => {
            confirmContract();
            onNavigate('dashboard');
          }}
          className="w-full py-5"
        >
          Confirmer et accéder au Dashboard
        </ActionButton>
      </div>
    </div>
  );
}
