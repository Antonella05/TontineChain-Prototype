import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CeloService } from '@/src/services/celoService';
import { db, handleFirestoreError, OperationType } from '@/src/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot 
} from 'firebase/firestore';

export type Frequency = 'hebdo' | 'bimensuel' | 'mensuel' | 'trimestriel';
export type PaymentStatus = 'payé' | 'en retard' | 'en attente';
export type RoundState = 'en-cours' | 'retardataire' | 'tous-payés' | 'libéré';

export interface Member {
  id: string;
  nom: string;
  initials: string;
  paidInCurrentRound: boolean;
}

export interface Transaction {
  id: string;
  type: 'contribution' | 'reception';
  amount: number;
  date: string;
  txHash: string;
  blockNumber: number;
  gasUsed: string;
  memberId: string;
}

export interface Tontine {
  id?: string;
  nom: string;
  montant: number;
  freq: Frequency;
  membres: Member[];
  ordre: 'aleatoire' | 'manuel';
  frais: number;
  penalite: number;
  contractAddress?: string;
  currentRound?: number;
  roundState?: RoundState;
  creatorId?: string;
  createdAt?: string;
}

interface AppState {
  isDarkMode: boolean;
  tontineCreated: boolean;
  contractConfirmed: boolean;
  paymentDone: boolean;
  contractAddress: string;
  tontine: Tontine | null;
  currentRound: number;
  roundState: RoundState;
  transactions: Transaction[];
  celoBalance: number;
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
  } | null;
  
  // Actions
  setUser: (user: any) => void;
  loadTontines: () => Promise<void>;
  toggleTheme: () => void;
  createTontine: (tontine: Tontine) => Promise<void>;
  joinTontine: (tontineId: string) => Promise<void>;
  confirmContract: () => void;
  markAsLate: () => Promise<void>;
  markSelfAsPaid: () => Promise<void>;
  processPayment: () => Promise<void>;
  advanceRound: () => Promise<void>;
  setRoundState: (state: RoundState) => void;
  resetApp: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      isDarkMode: true,
      tontineCreated: false,
      contractConfirmed: false,
      paymentDone: false,
      contractAddress: '',
      tontine: null,
      currentRound: 1,
      roundState: 'en-cours',
      transactions: [],
      celoBalance: 0,
      user: null,

      setUser: (userData) => {
        if (!userData) {
          set({ user: null, tontine: null, tontineCreated: false, contractConfirmed: false });
          return;
        }
        set({
          user: {
            uid: userData.uid,
            displayName: userData.displayName,
            email: userData.email,
            photoURL: userData.photoURL
          }
        });
        get().loadTontines();
      },

      loadTontines: async () => {
        const { user } = get();
        if (!user) return;

        // Try to find a tontine where the user is creator OR member
        const qCreator = query(
          collection(db, 'tontines'),
          where('creatorId', '==', user.uid)
        );

        try {
          let tontines: (Tontine & { id: string })[] = [];
          
          const creatorSnapshot = await getDocs(qCreator);
          tontines = creatorSnapshot.docs.map(doc => doc.data() as Tontine & { id: string });

          // If not creator, check if they are a member of any tontine
          // Note: Firestore doesn't support complex "in array of objects" queries well for nested members without a secondary index
          // For this app, we'll fetch tontines and filter client-side for now, or assume we join via ID
          
          if (tontines.length === 0) {
            // Check all tontines if the user is in the members list
            // In a production app, we'd use a separate collection 'memberships'
            const allQ = query(collection(db, 'tontines'));
            const allSnapshot = await getDocs(allQ);
            tontines = allSnapshot.docs
              .map(doc => doc.data() as Tontine & { id: string })
              .filter(t => t.membres.some(m => m.id === user.uid));
          }

          if (tontines.length > 0) {
            const latest = tontines[0];
            
            // Also fetch transactions for this tontine
            const txQuery = query(collection(db, 'transactions'), where('tontineId', '==', latest.id));
            const txSnapshot = await getDocs(txQuery);
            const txs = txSnapshot.docs.map(d => d.data() as Transaction).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            set({
              tontine: latest,
              tontineCreated: true,
              contractConfirmed: true,
              contractAddress: latest.contractAddress || '',
              currentRound: latest.currentRound || 1,
              transactions: txs,
              roundState: latest.roundState || 'en-cours'
            });
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'tontines');
        }
      },

      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

      createTontine: async (tontineData) => {
        const { user } = get();
        if (!user) return;

        const receipt = await CeloService.callContract('deployTontine', [tontineData.nom]);
        
        const tontineId = Math.random().toString(36).substr(2, 9);
        const finalTontine: Tontine = {
          ...tontineData,
          id: tontineId,
          creatorId: user.uid,
          contractAddress: receipt.hash.slice(0, 42),
          currentRound: 1,
          roundState: 'en-cours' as RoundState,
          createdAt: new Date().toISOString()
        };

        try {
          await setDoc(doc(db, 'tontines', tontineId), finalTontine);
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `tontines/${tontineId}`);
        }

        set({
          tontine: finalTontine,
          tontineCreated: true,
          contractAddress: finalTontine.contractAddress,
          transactions: [],
          currentRound: 1,
          roundState: 'en-cours',
          celoBalance: 1.0
        });
      },

      joinTontine: async (tontineId) => {
        const { user } = get();
        if (!user) throw new Error("Utilisateur non connecté");

        try {
          // 1. Fetch tontine
          const tSnapshot = await getDocs(query(collection(db, 'tontines'), where('id', '==', tontineId)));
          if (tSnapshot.empty) {
            throw new Error("Tontine introuvable");
          }

          const tDoc = tSnapshot.docs[0];
          const tData = tDoc.data() as Tontine;

          // 2. Check if already member
          const exists = tData.membres.find(m => m.id === user.uid);
          if (exists) {
            set({
              tontine: { ...tData, id: tDoc.id },
              tontineCreated: true,
              contractConfirmed: true,
              contractAddress: tData.contractAddress
            });
            return;
          }

          // 3. Add user to members
          const newMember: Member = {
            id: user.uid,
            nom: user.displayName || 'Utilisateur',
            initials: (user.displayName || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            paidInCurrentRound: false
          };

          const updatedMembers = [...tData.membres, newMember];
          await updateDoc(doc(db, 'tontines', tDoc.id), {
             membres: updatedMembers
          });

          set({
            tontine: { ...tData, id: tDoc.id, membres: updatedMembers },
            tontineCreated: true,
            contractConfirmed: true,
            contractAddress: tData.contractAddress
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `tontines/${tontineId}`);
          throw error;
        }
      },

      markAsLate: async () => {
        const { tontine } = get();
        if (!tontine || !tontine.id) return;

        try {
          await updateDoc(doc(db, 'tontines', tontine.id), {
            roundState: 'retardataire'
          });
          set({ 
            roundState: 'retardataire',
            tontine: { ...tontine, roundState: 'retardataire' }
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `tontines/${tontine.id}`);
        }
      },

      confirmContract: () => set({ contractConfirmed: true }),

      markSelfAsPaid: async () => {
        const { tontine, transactions, celoBalance, user } = get();
        if (!tontine || !user) return;

        const receipt = await CeloService.callContract('contribute', [tontine.montant]);
        const myName = user.displayName || 'Moi';

        const updatedMembres = tontine.membres.map(m => 
          m.nom === myName || m.id === user.uid ? { ...m, paidInCurrentRound: true } : m
        );

        const newTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'contribution',
          amount: tontine.montant,
          date: new Date().toISOString(),
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          memberId: user.uid
        };

        try {
          await updateDoc(doc(db, 'tontines', (tontine as any).id), {
            membres: updatedMembres
          });
          await setDoc(doc(db, 'transactions', newTx.id), { ...newTx, tontineId: (tontine as any).id });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'sync');
        }

        set({
          tontine: { ...tontine, membres: updatedMembres },
          paymentDone: true,
          transactions: [newTx, ...transactions],
          celoBalance: celoBalance - 0.001
        });
      },

      processPayment: async () => {
        await get().markSelfAsPaid();
      },

      advanceRound: async () => {
        const { currentRound, tontine, transactions, celoBalance } = get();
        if (!tontine) return;

        const receipt = await CeloService.callContract('releaseFunds', [currentRound]);

        const beneficiary = tontine.membres[(currentRound - 1) % tontine.membres.length];
        const receptionAmount = (tontine.montant * tontine.membres.length) - (tontine.frais || 0);
        const receptionTx: Transaction = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'reception',
          amount: receptionAmount,
          date: new Date().toISOString(),
          txHash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed,
          memberId: beneficiary.id
        };

        const updatedMembres = tontine.membres.map(m => ({ ...m, paidInCurrentRound: false }));
        const nextRound = currentRound + 1;

        try {
          await updateDoc(doc(db, 'tontines', (tontine as any).id), {
            currentRound: nextRound,
            membres: updatedMembres
          });
          await setDoc(doc(db, 'transactions', receptionTx.id), { ...receptionTx, tontineId: (tontine as any).id });
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'sync');
        }

        set({
          currentRound: nextRound,
          roundState: 'en-cours',
          paymentDone: false,
          tontine: {
            ...tontine,
            currentRound: nextRound,
            membres: updatedMembres
          },
          transactions: [receptionTx, ...transactions],
          celoBalance: celoBalance + 0.005
        });
      },

      setRoundState: (state) => set({ roundState: state }),

      resetApp: () => set({
        tontineCreated: false,
        contractConfirmed: false,
        paymentDone: false,
        tontine: null,
        contractAddress: '',
        currentRound: 1,
        roundState: 'en-cours',
        transactions: [],
        celoBalance: 0
      }),
    }),
    {
      name: 'tontine-chain-storage',
    }
  )
);
