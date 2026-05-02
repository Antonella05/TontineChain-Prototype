import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore, Tontine, Frequency, Member } from '@/src/store/useAppStore';
import { ActionButton, ProgressBar } from '@/src/components/UI';
import { sanitize, generateInitials, cn } from '@/src/lib/utils';
import { ChevronLeft, Plus, X, ShieldAlert, Cpu } from 'lucide-react';

export function CreateScreen({ onNavigate }: { onNavigate: (page: string) => void }) {
  const createTontine = useAppStore(state => state.createTontine);
  const user = useAppStore(state => state.user);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [freq, setFreq] = useState<Frequency>('mensuel');
  const [fees, setFees] = useState('500');
  const [penalty, setPenalty] = useState('1000');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [members, setMembers] = useState<string[]>([user?.displayName || 'Moi']);
  const [newMember, setNewMember] = useState('');
  const [order, setOrder] = useState<'aleatoire' | 'manuel'>('aleatoire');
  const [isDeploying, setIsDeploying] = useState(false);

  const progress = useMemo(() => {
    let p = 0;
    if (name.length >= 3) p += 15;
    if (Number(amount) >= 1000) p += 15;
    if (freq) p += 15;
    if (fees) p += 10;
    if (penalty) p += 10;
    if (startDate) p += 10;
    if (members.length >= 2) p += 15;
    if (order) p += 15;
    return Math.min(p, 100);
  }, [name, amount, freq, fees, penalty, startDate, members, order]);

  const addMember = () => {
    if (newMember.trim() && !members.includes(newMember)) {
      setMembers([...members, sanitize(newMember)]);
      setNewMember('');
    }
  };

  const removeMember = (idx: number) => {
    if (members[idx] === (user?.displayName || 'Moi')) return;
    setMembers(members.filter((_, i) => i !== idx));
  };

  const handleDeploy = async () => {
    setIsDeploying(true);
    
    try {
      const formattedMembers: Member[] = members.map(m => ({
        id: m === (user?.displayName || 'Moi') ? (user?.uid || Math.random().toString(36).substr(2, 9)) : Math.random().toString(36).substr(2, 9),
        nom: m,
        initials: generateInitials(m),
        paidInCurrentRound: false
      }));

      await createTontine({
        nom: sanitize(name),
        montant: Number(amount),
        freq,
        membres: formattedMembers,
        ordre: order,
        frais: Number(fees),
        penalite: Number(penalty)
      });
      
      setIsDeploying(false);
      onNavigate('confirm');
    } catch (error) {
      console.error('Deployment failed:', error);
      setIsDeploying(false);
      alert('Le déploiement a échoué. Veuillez vérifier votre connexion et réessayer.');
    }
  };

  if (isDeploying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-10 bg-bg-main text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1],
          }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-24 h-24 rounded-full border-4 border-t-primary border-r-forest border-b-primary border-l-forest mb-8 flex items-center justify-center"
        >
          <Cpu className="text-primary size-10" />
        </motion.div>
        <h2 className="text-2xl font-black text-primary mb-4">Déploiement du Contrat...</h2>
        <p className="text-text-muted text-sm">Le smart contract est en train d'être inscrit sur le réseau Celo.</p>
        
        <div className="mt-10 w-full glass p-4 rounded-xl font-mono text-[10px] text-forest space-y-1 text-left overflow-hidden">
          <p className="">&gt; Compiling Tontine.sol...</p>
          <p className="">&gt; Optimizing Bytecode (version 0.8.19)...</p>
          <p className="">&gt; Estimated Gas: 1,240,532 CELO...</p>
          <p className="animate-pulse">&gt; Broadcasting Transaction to nodes...</p>
          <p className="text-text-muted opacity-40">&gt; tx: 0x{Array(40).fill(0).map(() => Math.floor(Math.random()*16).toString(16)).join('',)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen pb-10 bg-bg-main">
      <header className="p-6 flex items-center justify-between sticky top-0 bg-bg-main z-10 border-b border-border-main">
        <button onClick={() => onNavigate('home')} className="p-2 -ml-2 text-text-muted"><ChevronLeft /></button>
        <h1 className="text-xl font-black text-text-main">Créer une Tontine</h1>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <div className="p-6 space-y-8">
        <ProgressBar progress={progress} className="mb-4" />

        {/* Name */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Nom de la Tontine</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex: Les Amis de Cotonou"
            className="w-full bg-bg-card border-2 border-border-main rounded-xl px-5 py-4 focus:border-primary focus:outline-none transition-colors text-text-main placeholder:text-text-muted/50"
          />
          {name.length > 0 && name.length < 3 && (
            <p className="text-xs text-danger pl-2">Minimum 3 caractères.</p>
          )}
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Montant de cotisation (FCFA)</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-primary font-bold">FCFA</span>
            <input 
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full bg-bg-card border-2 border-border-main rounded-xl pl-16 pr-5 py-4 focus:border-primary focus:outline-none text-text-main placeholder:text-text-muted/50"
            />
          </div>
          {amount && Number(amount) < 1000 && (
            <p className="text-xs text-danger pl-2">Minimum 1 000 FCFA.</p>
          )}
        </div>

        {/* Frequency */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Fréquence</label>
          <div className="grid grid-cols-2 gap-2">
            {(['hebdo', 'bimensuel', 'mensuel', 'trimestriel'] as Frequency[]).map(f => (
              <button
                key={f}
                onClick={() => setFreq(f)}
                className={cn(
                  "py-3 rounded-xl border-2 capitalize font-medium text-sm transition-all",
                  freq === f ? "border-primary bg-primary/10 text-primary" : "border-border-main bg-bg-card text-text-muted"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Fees */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Frais de gestion par tour (FCFA)</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold">FCFA</span>
            <input 
              type="number"
              value={fees}
              onChange={(e) => setFees(e.target.value)}
              placeholder="500"
              className="w-full bg-bg-card border-2 border-border-main rounded-xl pl-16 pr-5 py-4 focus:border-primary focus:outline-none text-text-main placeholder:text-text-muted/50"
            />
          </div>
          <p className="text-[10px] text-text-muted pl-2">Ces frais seront déduits de la cagnotte versée au bénéficiaire.</p>
        </div>

        {/* Penalty */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Pénalité de retard (FCFA)</label>
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted font-bold">FCFA</span>
            <input 
              type="number"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="1000"
              className="w-full bg-bg-card border-2 border-border-main rounded-xl pl-16 pr-5 py-4 focus:border-primary focus:outline-none text-text-main placeholder:text-text-muted/50"
            />
          </div>
          <p className="text-[10px] text-rose-500 pl-2">S'applique en cas d'incident de non-paiement déclaré.</p>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Date de premier tour</label>
          <input 
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-bg-card border-2 border-border-main rounded-xl px-5 py-4 focus:border-primary focus:outline-none transition-colors text-text-main"
          />
        </div>

        {/* Members */}
        <div className="space-y-4">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Membres ({members.length})</label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={newMember}
              onChange={(e) => setNewMember(e.target.value)}
              placeholder="Nom du membre"
              className="flex-1 bg-bg-card border-2 border-border-main rounded-xl px-4 py-3 focus:border-primary outline-none text-text-main"
              onKeyPress={(e) => e.key === 'Enter' && addMember()}
            />
            <button onClick={addMember} className="bg-forest p-3 rounded-xl text-primary"><Plus /></button>
          </div>
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {members.map((m, i) => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="bg-bg-card px-3 py-2 rounded-lg flex items-center gap-2 border border-border-main shadow-sm"
                >
                  <span className="text-xs font-bold text-text-main">{m}</span>
                  {m !== 'Moi' && (
                    <button onClick={() => removeMember(i)} className="text-danger"><X size={14} /></button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Order */}
        <div className="space-y-2">
          <label className="text-xs uppercase font-black text-text-muted tracking-widest pl-2">Ordre des bénéficiaires</label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setOrder('aleatoire')}
              className={cn(
                "p-4 rounded-xl border-2 flex flex-col gap-2 transition-all text-left shadow-sm",
                order === 'aleatoire' ? "border-primary bg-primary/5" : "border-border-main bg-bg-card"
              )}
            >
              <span className={cn("font-bold", order === 'aleatoire' ? "text-primary" : "text-text-muted")}>Aléatoire</span>
              <span className="text-[10px] text-text-muted">Tiré au sort par le contrat</span>
            </button>
            <button
              onClick={() => setOrder('manuel')}
              className={cn(
                "p-4 rounded-xl border-2 flex flex-col gap-2 transition-all text-left shadow-sm",
                order === 'manuel' ? "border-primary bg-primary/5" : "border-border-main bg-bg-card"
              )}
            >
              <span className={cn("font-bold", order === 'manuel' ? "text-primary" : "text-text-muted")}>Manuel</span>
              <span className="text-[10px] text-text-muted">Vous fixez l'ordre</span>
            </button>
          </div>
        </div>

        {/* Security Info */}
        <div className="bg-forest/10 border-2 border-forest/30 p-5 rounded-2xl flex gap-4">
          <ShieldAlert className="text-primary size-8 shrink-0" />
          <p className="text-xs leading-relaxed">
            <span className="font-bold text-primary">Attention:</span> Une fois déployé sur la <span className="text-primary font-bold">Blockchain Celo</span>, les règles de cette tontine ne pourront plus être modifiées. L'Immutabilité garantit la confiance entre membres.
          </p>
        </div>

        <ActionButton 
          disabled={progress < 100}
          onClick={handleDeploy}
          className="w-full"
        >
          Déployer le smart contract
        </ActionButton>
      </div>
    </div>
  );
}
