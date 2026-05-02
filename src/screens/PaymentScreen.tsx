import { useState } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/src/store/useAppStore';
import { ActionButton, ProgressBar } from '@/src/components/UI';
import { formatFCFA, cn } from '@/src/lib/utils';
import { ChevronLeft, ShieldCheck, CreditCard, Wallet, Cpu } from 'lucide-react';

export function PaymentScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { tontine, processPayment, contractAddress, currentRound } = useAppStore();
  const [selectedMethod, setSelectedMethod] = useState<'orange' | 'mtn' | 'wave' | 'moov'>('orange');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'input' | 'push' | 'blockchain'>('input');

  if (!tontine) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-text-muted">Sécurisation de la passerelle de paiement...</p>
      </div>
    );
  }

  const beneficiary = tontine.membres[(currentRound - 1) % tontine.membres.length];
  const paidCount = tontine.membres.filter(m => m.paidInCurrentRound).length;

  const handlePay = async () => {
    if (!phoneNumber) {
      alert("Veuillez entrer votre numéro de téléphone.");
      return;
    }
    
    setIsProcessing(true);
    
    // Step 1: Simulate USSD Push
    setStep('push');
    await new Promise(r => setTimeout(r, 3000));
    
    // Step 2: Simulate Blockchain Sync
    setStep('blockchain');
    await processPayment();
    
    setIsProcessing(false);
    onNavigate('tour');
  };

  const methods = [
    { id: 'orange', name: 'Orange Money', logo: 'OM', color: 'bg-[#FF6600]' },
    { id: 'mtn', name: 'MTN Mobile Money', logo: 'MTN', color: 'bg-[#FFCC00]' },
    { id: 'wave', name: 'Wave', logo: 'W', color: 'bg-[#1FBAD6]' },
    { id: 'moov', name: 'Moov Money', logo: 'Mv', color: 'bg-[#002244]' },
  ];

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 bg-forest/20 rounded-full flex items-center justify-center mb-8 border border-primary/20"
        >
          {step === 'push' ? (
            <div className="text-primary font-black text-2xl animate-bounce">📱</div>
          ) : (
            <Cpu className="text-primary size-12 animate-pulse" />
          )}
        </motion.div>
        
        <h2 className="text-2xl font-black text-primary mb-2">
          {step === 'push' ? 'Validation Mobile' : 'Broadcasting...'}
        </h2>
        
        <p className="text-text-muted text-sm px-4">
          {step === 'push' 
            ? `Tapez votre code secret sur votre téléphone pour valider le paiement vers ${methods.find(m => m.id === selectedMethod)?.name}.`
            : "Signature de la transaction de cotisation sur la blockchain Celo en cours."}
        </p>
        
        {step === 'blockchain' && (
          <div className="mt-10 w-full glass p-4 rounded-xl font-mono text-[9px] text-forest space-y-1 text-left">
             <p>&gt; Initializing Provider...</p>
             <p>&gt; Signer: Afiwa_Kouassi.celo</p>
             <p>&gt; Nonce: {Math.floor(Math.random() * 100)}</p>
             <p className="animate-pulse">&gt; tx: 0x{Array(32).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('')}...</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-bg-main z-10 border-b border-border-main">
        <button onClick={() => onNavigate('dashboard')} className="p-2 -ml-2 text-text-muted"><ChevronLeft /></button>
        <h1 className="text-xl font-black text-text-main">Cotisation</h1>
        <div className="w-10" />
      </header>

      <div className="p-6 flex-1 flex flex-col gap-8 pb-10">
        {/* Amount Display */}
        <div className="relative py-10 flex flex-col items-center justify-center text-center rounded-[40px] overflow-hidden glass">
          <div className="absolute inset-0 bg-radial-gradient from-forest/30 to-transparent blur-3xl opacity-50" />
          <p className="relative z-10 text-[10px] font-black text-primary uppercase tracking-widest mb-2 px-3 py-1 bg-primary/10 rounded-full">Tour #{currentRound}</p>
          <h2 className="relative z-10 text-5xl font-black text-text-main tracking-tight">
            {formatFCFA(tontine.montant + (tontine.roundState === 'retardataire' ? (tontine.penalite || 0) : 0))}
          </h2>
          {tontine.roundState === 'retardataire' && (
            <p className="relative z-10 text-[10px] text-rose-500 font-bold">Pénalité de retard incluse</p>
          )}
        </div>

        {/* Beneficiary Card */}
        <div className="glass p-5 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 bg-forest/20 rounded-2xl flex items-center justify-center border border-forest/30">
             <ShieldCheck className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-black text-text-muted">Bénéficiaire du tour</p>
            <p className="font-bold text-text-main">{beneficiary.nom} {beneficiary.nom === 'Moi' ? '(Vous)' : ''}</p>
          </div>
        </div>

        {/* Methods */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Mode de paiement</h3>
          <div className="grid grid-cols-2 gap-3">
            {methods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id as any)}
                className={cn(
                  "p-4 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all",
                  selectedMethod === method.id ? "border-primary bg-primary/5" : "border-border-main bg-bg-card"
                )}
              >
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-[8px] font-black text-white", method.color)}>
                  {method.logo}
                </div>
                <span className="text-[10px] font-bold">{method.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Phone Input */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black text-text-muted tracking-widest pl-2">Numéro Mobile Money</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted font-bold text-sm">+225</span>
            <input 
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="00 00 00 00 00"
              className="w-full bg-bg-card border-2 border-border-main rounded-xl pl-16 pr-4 py-4 focus:border-primary focus:outline-none text-text-main placeholder:text-text-muted/50 font-mono"
            />
          </div>
          <p className="text-[9px] text-text-muted pl-2">Un message de validation (Push USSD) sera envoyé sur ce numéro.</p>
        </div>

        <ActionButton onClick={handlePay} className="w-full mt-auto">
          Signer & Payer
        </ActionButton>

        <p className="text-center text-[9px] text-text-muted font-medium">
          Droit à l'immutabilité · Transaction irréversible · Audité
        </p>
      </div>
    </div>
  );
}
