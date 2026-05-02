# TontineChain

> **Prototype fonctionnel — MIABE Hackathon 2026 | Équipe 4Ward Chain (BJ-09)**

TontineChain modernise l'épargne rotative africaine en combinant la transparence de la blockchain **Celo** avec la simplicité du Mobile Money. Le résultat : une tontine où les règles sont fixées à l'avance, les paiements sont tracés de façon immuable et la cagnotte est libérée automatiquement, sans intervention humaine.

---

## Démo en ligne

**Prototype déployée :**
[https://tontinechain-854570537024.europe-west2.run.app](https://tontinechain-854570537024.europe-west2.run.app)

**Site vitrine :**
[https://tontine-chain-seven.vercel.app](https://tontine-chain-seven.vercel.app)

---

## Le problème résolu

En Afrique, 60 à 70 % des adultes participent à une tontine. Pourtant, 15 à 20 % de ces groupes subissent chaque année un incident majeur : détournement de fonds, fuite de l'organisateur, litiges de gestion. Les victimes, majoritairement des femmes, n'ont aucun recours car le système repose entièrement sur la confiance placée dans une seule personne.

TontineChain supprime ce point de défaillance en remplaçant l'organisateur humain par un contrat intelligent.

---

## Fonctionnalités du prototype

- Création de tontine avec règles personnalisables (montant, fréquence, frais, pénalités)
- Simulation de paiements mobiles : Orange Money, MTN, Moov, Wave
- Gestion des incidents de paiement avec application automatique des pénalités
- Traçabilité des transactions via la blockchain Celo (simulée dans ce prototype)
- Tableau de bord : suivi des paiements, bénéficiaire actuel, progression du tour
- Authentification Google et interface responsive mobile-first

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| State management | Zustand |
| Base de données | Firebase Firestore |
| Authentification | Firebase Authentication (Google) |
| Blockchain | Celo (simulé via `celoService.ts`) |
| Animations | motion/react |
| Icônes | Lucide React |
| Déploiement | Google Cloud Run |

---

## Pourquoi Celo ?

Celo est une blockchain mobile-first conçue pour l'inclusion financière en Afrique. Elle permet de payer les frais de transaction en stablecoin (cUSD), ce qui élimine la volatilité pour les utilisateurs. Elle est compatible avec les numéros de téléphone comme identifiants de portefeuille, ce qui facilite l'intégration USSD pour les personnes sans smartphone.

Dans ce prototype, la logique Celo est simulée dans `src/services/celoService.ts`. La migration vers le réseau Celo réel nécessite uniquement de remplacer les appels simulés par des appels Web3 réels — la structure est déjà en place.

---

## Architecture du projet

```
src/
├── App.tsx                     # Navigation et logique de page
├── store/
│   └── useAppStore.ts          # État global, actions, synchronisation Firestore
├── services/
│   └── celoService.ts          # Interactions blockchain Celo (simulées)
├── lib/
│   └── firebase.ts             # Initialisation Firebase et gestion des erreurs
├── screens/                    # Ecrans de l'application
├── components/                 # Composants UI réutilisables
firestore.rules                 # Règles de sécurité Firestore
firebase-applet-config.json     # Configuration Firebase
```

---

## Flux utilisateur

### Créateur de tontine

1. Se connecter avec Google
2. Cliquer sur "Créer une tontine"
3. Renseigner les paramètres : nom, montant, fréquence, frais, pénalités
4. Ajouter les membres
5. Déployer le contrat (simulation Celo)
6. Partager l'ID de la tontine avec les participants

### Participant

1. Se connecter avec Google
2. Cliquer sur "Rejoindre une tontine"
3. Entrer l'ID fourni par le créateur
4. Cotiser à chaque tour via le mode de paiement choisi

---

## Prérequis

- Node.js 20 ou supérieur
- npm
- Un projet Firebase avec Firestore activé

---

## Installation locale

### 1. Cloner le dépôt

```bash
git clone <url-du-repo> tontinechain
cd tontinechain
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` à la racine du projet en vous basant sur `.env.example` :

```bash
cp .env.example .env
```

Renseigner les valeurs Firebase dans `.env` :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Ces informations se trouvent dans la console Firebase de votre projet, sous **Paramètres du projet > Vos applications**.

### 4. Lancer l'application

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

---

## Commandes disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Construire l'application pour la production |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Vérifier le code TypeScript |
| `npm run clean` | Supprimer le dossier `dist` |

---

## Sécurité

Les règles Firestore (`firestore.rules`) garantissent que :

- seul le créateur peut modifier les paramètres critiques d'une tontine
- chaque membre ne peut valider que ses propres paiements
- aucune opération non autorisée ne peut être effectuée côté client

---

## Statut du prototype et roadmap

Ce prototype a été développé dans le cadre du MIABE Hackathon 2026. Il valide le flux complet de gestion d'une tontine. Les prochaines étapes pour une version production sont :

- [ ] Intégration Celo réelle (remplacement de `celoService.ts` par des appels Web3)
- [ ] Interface USSD pour les utilisateurs sans smartphone
- [ ] Smart contract audité et déployé sur le testnet Celo Alfajores
- [ ] Intégration directe avec les opérateurs Mobile Money (Orange, MTN, Moov, Wave)
- [ ] Système de réputation des membres basé sur l'historique on-chain

---

## Equipe

**4Ward Chain — BJ-09**

Équipe béninoise engagée pour l'inclusion financière et la blockchain en Afrique.

Hope ALOKPO
Fawann AZA
Bienvenu ESSEGNON
Antonella TAMADAHO

---

## Licence

Projet développé dans le cadre du MIABE Hackathon 2026. Tous droits réservés à l'équipe 4Ward Chain.
