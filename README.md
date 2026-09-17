# ZEN — Traçabilité Intelligente des Lots

Plateforme de suivi des lots agroalimentaires (huile d'olive, dattes...) du producteur au produit fini : origine, contrôles qualité, transformation, stock et rappel ciblé en cas d'incident.

**Test technique ZEN Group — Fullstack AI / Automation — Série A · Choix A2**

---

## 🗺️ Comprendre l'application en 2 minutes

Un lot naît à la **réception fournisseur** avec un code unique et un QR code. Il traverse ensuite un cycle de vie :

```
Réception ──▶ Contrôle qualité ──▶ Fractionnement (optionnel) ──▶ Recombinaison (optionnel) ──▶ Rappel (si incident)
   │                 │                                                                              │
   ▼                 ▼                                                                              ▼
 EN_ATTENTE    VALIDE / QUARANTAINE / BLOQUE                                                     RAPPELE
```

- Un **contrôle qualité** (température, acidité, humidité) évalue automatiquement le lot et met à jour son statut.
- Un lot peut être **fractionné** en plusieurs sous-lots (traçabilité parent → enfants) ou plusieurs lots peuvent être **recombinés** en un seul.
- En cas de non-conformité grave, un **rappel** identifie automatiquement tous les lots descendants concernés.
- Chaque lot conserve une **timeline immuable** (mouvements, contrôles, documents) consultable via son QR code.

---

## 👥 Rôles et permissions

L'accès est contrôlé par rôle à la fois côté backend (middleware `requireRole`) et côté frontend (masquage des actions non autorisées) :

| Action | Opérateur | Qualité | Admin |
|---|:---:|:---:|:---:|
| Créer un lot | ✅ | ✅ | ✅ |
| Soumettre un contrôle qualité | ✅ | ✅ | ✅ |
| Fractionner / recombiner un lot | ✅ | ❌ | ✅ |
| Valider officiellement un contrôle | ❌ | ✅ | ✅ |
| Lancer un rappel de lot | ❌ | ✅ | ✅ |
| Gérer les utilisateurs et leurs rôles | ❌ | ❌ | ✅ |

---

## 🏗️ Architecture technique

```
zen-project/
├── backend/                  Node.js + Express + Prisma + PostgreSQL
│   ├── prisma/
│   │   ├── schema.prisma     Modèle de données
│   │   └── migrations/
│   └── src/
│       ├── routes/           lots, auth, controles, rappels, documents, users
│       ├── utils/            auth (JWT/rôles), qrGenerator, qualityRules, audit
│       └── index.js
└── frontend/                 React + Vite
    └── src/
        ├── api/client.js     Client HTTP (fetch) vers l'API
        ├── context/          AuthContext (session utilisateur)
        ├── components/       Layout, Sidebar, ProtectedRoute, StatusBadge
        └── pages/            Login, Register, Dashboard, CreateLot, LotDetail,
                               Fractionner, Recombiner, ScanControle, Rappels, Users
```

**Stack :** React (Vite) · Node.js / Express · PostgreSQL · Prisma ORM · JWT (authentification) · bcrypt (mots de passe) · qrcode (génération QR)

---

## ✅ Fonctionnalités

### Gestion des lots
- Création d'un lot avec génération automatique d'un **code unique** et d'un **QR code**
- Registre filtrable par produit, origine, campagne et statut
- Fiche détail avec **timeline chronologique** (mouvements + contrôles + documents)
- **Fractionnement** : un lot parent peut être divisé en plusieurs lots enfants (la somme ne peut pas dépasser la quantité disponible)
- **Recombinaison** : plusieurs lots du même produit, non bloqués, peuvent être fusionnés en un seul lot traçable vers ses sources

### Contrôle qualité
Chaque contrôle est évalué automatiquement selon des seuils configurables (`backend/src/utils/qualityRules.js`) :

| Résultat de l'évaluation | Statut du lot |
|---|---|
| Conforme | `VALIDE` |
| À vérifier (écart mineur) | `QUARANTAINE` |
| Non conforme (écart critique ou péremption dépassée) | `BLOQUE` |

Un contrôle soumis par un opérateur peut ensuite être **validé officiellement** par un responsable qualité ou un admin.

### Documents & certificats
- Ajout de certificats (analyses, conformité) liés à un lot, avec **gestion de version** automatique
- Détection visuelle des documents **expirés**

### Rappel de lot
- Calcul **récursif des descendants** d'un lot (fractionnements en cascade inclus)
- Empêche le déclenchement d'un second rappel sur un lot déjà rappelé
- Identifie les clients/stocks concernés (jeu de données de démonstration)

### Sécurité
- Authentification par **JWT**, mots de passe hashés (bcrypt)
- Autorisations par rôle appliquées sur chaque route sensible
- **Journal d'audit** (append-only) des actions critiques (validation, rappel, suppression de document)

---

## 🧭 Pages de l'application

| Route | Page | Accès |
|---|---|---|
| `/login` | Connexion | Public |
| `/register` | Création de compte (rôle Opérateur par défaut) | Public |
| `/` | Tableau de bord | Authentifié |
| `/lots/nouveau` | Réception d'un nouveau lot | Opérateur, Admin |
| `/lots/:id` | Fiche détail d'un lot (timeline, documents, rappel) | Authentifié |
| `/lots/:id/fractionner` | Fractionnement d'un lot | Opérateur, Admin |
| `/recombiner` | Recombinaison de lots | Opérateur, Admin |
| `/controle-terrain` | Saisie d'un contrôle qualité (par code de lot) | Authentifié |
| `/rappels` | Recherche de lot pour déclencher un rappel | Qualité, Admin |
| `/utilisateurs` | Gestion des rôles utilisateurs | Admin |

---

## 📦 Installation locale

### Prérequis
- Node.js ≥ 18
- PostgreSQL (local ou instance cloud)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Renseigner DATABASE_URL et JWT_SECRET dans .env

npx prisma migrate dev
npm run dev              # démarre sur http://localhost:4000
```

`.env.example` :
```
DATABASE_URL="postgresql://user:password@localhost:5432/zen_db?schema=public"
PORT=4000
JWT_SECRET=your_jwt_secret_here
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
# VITE_API_URL=http://localhost:4000/api

npm run dev               # démarre sur http://localhost:5173
```

### Premier compte

Il n'existe pas de compte par défaut : créez le premier compte via `/register` (rôle `OPERATEUR`), puis promouvez-le en `ADMIN` directement dans la base :
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'votre-email@exemple.tn';
```
Une fois connecté en Admin, la page `/utilisateurs` permet de gérer tous les rôles depuis l'interface.

---

## 🔌 Aperçu de l'API

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Inscription (rôle Opérateur) |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/lots` | Liste des lots (filtres : produit, origine, campagne, statut) |
| POST | `/api/lots` | Créer un lot |
| GET | `/api/lots/:id` | Détail d'un lot (timeline complète) |
| POST | `/api/lots/:id/fractionner` | Fractionner un lot |
| POST | `/api/lots/recombiner` | Recombiner plusieurs lots |
| GET | `/api/lots/:id/descendants` | Descendants d'un lot |
| POST | `/api/controles/:lotId` | Soumettre un contrôle qualité |
| POST | `/api/controles/by-code/:lotCode` | Contrôle via code scanné |
| PATCH | `/api/controles/:id/valider` | Valider un contrôle (Qualité/Admin) |
| GET / POST | `/api/documents/:lotId` | Lister / ajouter un document |
| DELETE | `/api/documents/:id` | Supprimer un document (Qualité/Admin) |
| POST | `/api/rappels/:lotId` | Lancer un rappel (Qualité/Admin) |
| GET | `/api/users` | Liste des utilisateurs (Admin) |
| PATCH | `/api/users/:id/role` | Modifier le rôle d'un utilisateur (Admin) |

---

## ⚠️ Choix techniques et limites connues

- Les clients concernés par un rappel sont simulés (jeu de données de démonstration), aucun module CRM réel.
- L'authentification repose sur un JWT simple (expiration 7 jours), sans refresh token.
- Les seuils de qualité sont codés en dur dans `qualityRules.js` ; à externaliser en base pour une configuration sans redéploiement.
- L'inscription publique (`/register`) crée uniquement des comptes `OPERATEUR` ; la promotion vers `QUALITE`/`ADMIN` se fait via la page de gestion des utilisateurs.

---

## 🎥 Livrables

- Application déployée : *[lien à compléter]*
- Dépôt Git avec historique de commits : *[lien à compléter]*
- `.env.example` (backend + frontend) sans secrets
- Jeu de données de démonstration
- Vidéo de démonstration (3–5 min) : *[lien à compléter]*
