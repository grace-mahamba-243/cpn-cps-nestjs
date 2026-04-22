# CPN-CPS Backend (NestJS)

API REST du système de gestion des consultations prénatales (CPN) et des consultations post-natales (CPS) pour la clinique HIMBI.

---

## Technologies

| Outil | Version |
|---|---|
| NestJS | 11 |
| TypeORM | 0.3 |
| MySQL | 8 |
| class-validator | 0.15 |
| OpenAI SDK | 6 |

---

## Prérequis

- Node.js >= 18
- MySQL 8 en cours d'exécution
- Base de données `cpn_cps_himbi` créée

---

## Installation et démarrage

```bash
# Installer les dépendances
npm install

# Démarrer en mode développement (hot-reload)
npm run start:dev

# Construire pour la production
npm run build

# Démarrer en production
npm run start:prod
```

L'API sera accessible sur `http://localhost:3000/api`.

---

## Variables d'environnement

Créer un fichier `.env` à la racine :

```env
# Application
APP_PORT=3000
APP_API_PREFIX=api

# Base de données
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=votre_mot_de_passe
DB_DATABASE=cpn_cps_himbi

# JWT
JWT_SECRET=votre_secret_jwt
JWT_EXPIRATION=8h

# OpenAI
OPENAI_API_KEY=sk-...
```

---

## Structure du projet

```
src/
├── app.module.ts          # Module racine — assemble tous les modules métier
├── main.ts                # Point d'entrée (bootstrap, CORS, validation globale)
├── config/
│   ├── app.config.ts      # Configuration de l'application (port, préfixe API)
│   └── database.config.ts # Configuration MySQL / TypeORM
├── database/
│   ├── data-source.ts     # Source de données TypeORM (CLI migrations)
│   ├── migrations/        # 33 fichiers de migration de la base de données
│   └── seeds/             # Données initiales (rôles, premier utilisateur admin)
└── modules/
    ├── accouchements/     # Fiches d'accouchement (controller, service, dto, entity)
    ├── auth/              # Authentification JWT (controller, service, dto, entities)
    ├── cpn/               # Consultations prénatales (controller, service, 7 dto, 3 entities)
    ├── cps-enfant/        # CPS enfant (controller, service, 4 dto, 3 entities)
    ├── cps-femme/         # CPS femme (controller, service, 7 dto, 3 entities)
    ├── dashboard/         # Statistiques et indicateurs (controller, service)
    ├── dossiers/          # Dossiers médicaux (controller, service)
    ├── enfants/           # Gestion des enfants (controller, service, 3 dto, 2 entities)
    ├── grossesses/        # Suivi des grossesses (controller, service)
    ├── impressions/       # Génération de documents (controller, service)
    ├── journal/           # Journal des activités cliniques (controller, service, dto, entity)
    ├── laboratoire/       # Résultats de laboratoire (controller, service, 2 dto)
    ├── nutrition/         # Suivi nutritionnel enfant (controller, service, dto, entity)
    ├── patientes/         # Gestion des patientes (controller, service, dto, entity)
    ├── pharmacie/         # Prescriptions et stock (controller, service)
    ├── rendez-vous/       # Gestion des rendez-vous (controller, service, 5 dto, entity)
    ├── roles/             # Gestion des rôles (controller, service, dto)
    ├── suivi-enfant/      # Suivi croissance enfant (controller, service, dto, entity)
    ├── users/             # Gestion des utilisateurs (controller, service, 2 dto)
    └── vaccination/       # Calendrier vaccinal et doses (controller, service, dto, entity)
```

---

## Modules et endpoints

| Module | Préfixe | Entités / DTOs |
|---|---|---|
| **auth** | `/api/auth` | Session, Utilisateur, Rôle |
| **users** | `/api/users` | create-user, update-user |
| **roles** | `/api/roles` | create-role |
| **patientes** | `/api/patientes` | Patiente, creer-patiente |
| **dossiers** | `/api/dossiers` | Dossiers médicaux |
| **grossesses** | `/api/grossesses` | Suivi des grossesses |
| **cpn** | `/api/cpn` | DossierCpn, ContactCpn, ExamenCpn |
| **cps-femme** | `/api/cps-femme` | DossierCps, VisiteCps, ExamenCpsFemme |
| **cps-enfant** | `/api/cps-enfant` | DossierCpsEnfant, VisiteCpsEnfant, ExamenCpsEnfant |
| **accouchements** | `/api/accouchements` | Accouchement, creer-accouchement |
| **enfants** | `/api/enfants` | Enfant, ExamenEnfant |
| **vaccination** | `/api/vaccination` | VaccinationDose, enregistrer-dose |
| **nutrition** | `/api/nutrition` | NutritionEnfant, creer-nutrition |
| **suivi-enfant** | `/api/suivi-enfant` | SuiviEnfant, creer-suivi |
| **laboratoire** | `/api/laboratoire` | prise-en-charge, saisir-resultat |
| **pharmacie** | `/api/pharmacie` | Prescriptions |
| **rendez-vous** | `/api/rendez-vous` | RendezVous, 5 DTOs (création, reprogrammation, statut…) |
| **impressions** | `/api/impressions` | Génération de documents |
| **dashboard** | `/api/dashboard` | Statistiques et indicateurs cliniques |
| **journal** | `/api/journal` | JournalActivite, creer-journal |

---

## Base de données

- SGBD : **MySQL 8**
- ORM : **TypeORM** avec synchronisation désactivée (`synchronize: false`)
- **33 migrations** dans `src/database/migrations/`
- Le fichier `src/database/seeds/001-auth-initialisation.sql` crée les rôles de base et le premier administrateur

### Exécuter les migrations

```bash
npx typeorm migration:run -d src/database/data-source.ts
```

---

## Assistant clinique IA

L'application intègre l'API **OpenAI** comme assistant clinique intelligent dans deux modules :

| Module | Usage |
|---|---|
| **CPN** | Analyse automatique des données de la consultation prénatale et suggestions cliniques |
| **CPS Femme** | Analyse des visites post-natales et recommandations de suivi |

L'assistant reçoit les données cliniques de la patiente et retourne une analyse structurée en JSON. Il est configuré comme assistant clinique CPN/CPS postnatal adapté au contexte d'une maternité à Goma, RDC.

> La clé API est configurée via la variable d'environnement `OPENAI_API_KEY`.

---

## Authentification

- Basée sur **JWT** (JSON Web Token)
- Le token est transmis dans l'en-tête HTTP : `Authorization: Bearer <token>`
- Les sessions actives sont stockées en base (`session-authentification`)
- Les routes protégées utilisent le guard JWT du module `auth`

---

## Commandes utiles

```bash
# Lancer les tests unitaires
npm run test

# Lancer les tests avec couverture
npm run test:cov

# Formatter le code
npm run format

# Linter
npm run lint
```
# Backend - Application de suivi CPN/CPS  
## Centre de Santé Himbi

## 1. Présentation du projet

Ce backend permet de gérer la logique métier et les données de l’application de suivi de la **Consultation Prénatale (CPN)**, de la **Consultation Postnatale / Soins Postnataux (CPS femme)**, du **suivi de l’enfant**, de la **vaccination**, des **rendez-vous**, de l’**accueil administratif**, ainsi que des interactions avec le **laboratoire** et la **pharmacie** au sein du **Centre de Santé Himbi**.

L’objectif est de construire une API REST modulaire, maintenable et évolutive, capable de supporter le frontend déjà en place et de respecter fidèlement le fonctionnement réel observé sur le terrain.

---

## 2. Contexte métier

L’application suit la logique métier suivante :

**Femme → grossesse → CPN → accouchement / issue de grossesse → CPS femme + dossier enfant → suivi enfant + vaccination**

### Répartition des rôles métier
- **CPN** : réalisée par **l’infirmier** ou la **sage-femme**
- **CPS femme** : réalisée par le **médecin**
- **Vaccination enfant** : réalisée par le **médecin**
- **Réceptionniste** :
  - accueil
  - recherche dossier
  - enregistrement administratif
  - gestion des rendez-vous
  - orientation
- **Laboratoire** : présent
- **Pharmacie** : présente
- **Échographie** : non disponible sur place

### Règles métier importantes
- La **CPS femme** suit la règle **6 heures, 6 jours, 6 semaines**
- Le **suivi enfant** va jusqu’à **59 mois**
- Les **rendez-vous** peuvent être :
  - planifiés
  - surprises
  - annulés
  - historisés
- L’**impression clinique** se fait chez le **médecin**
- Une femme peut venir en **CPS** même si elle n’a pas fait sa **CPN** ou son **accouchement** au centre

---

## 3. Objectifs du backend

Ce backend doit permettre de :

- centraliser les données cliniques et administratives
- structurer les dossiers des femmes et des enfants
- gérer les parcours CPN, CPS femme et suivi enfant
- gérer la vaccination de l’enfant
- gérer les rendez-vous et leur historique
- exposer une API REST claire pour le frontend
- garantir la validation des données
- assurer une architecture modulaire facile à maintenir
- permettre l’évolution future du système

---

## 4. Stack technique

- **NestJS**
- **MySQL**
- **API REST**
- **Architecture modulaire**
- **CRUD**
- **Validation via DTO**
- **Organisation par modules métier**

---

## 5. Principes d’architecture

Le backend est organisé par **modules métier**.

Chaque module suit une logique claire :

**module → analyse métier → acteurs → données → règles métier → entités → DTO → service → contrôleur → endpoints → validation → issues**

Cette approche permet :
- une meilleure lisibilité
- une séparation claire des responsabilités
- une maintenance plus simple
- un développement progressif par module

---

## 6. Modules métier prévus

### Modules principaux
- authentification
- utilisateurs et rôles
- patientes
- grossesses
- CPN
- accouchements / issues de grossesse
- CPS femme
- enfants
- suivi enfant
- vaccination
- rendez-vous
- dossiers cliniques
- laboratoire
- pharmacie
- impression clinique
- tableau de bord / statistiques

---

## 7. Organisation fonctionnelle générale

### Parcours femme
1. accueil et enregistrement administratif
2. création ou recherche du dossier
3. création de la grossesse
4. suivi CPN
5. enregistrement de l’accouchement ou de l’issue de grossesse
6. CPS femme selon 6h, 6 jours, 6 semaines
7. création du dossier enfant si nécessaire
8. suivi enfant
9. vaccination

### Cas particulier
Une femme peut venir en **CPS femme** même :
- sans avoir fait de CPN au centre
- sans avoir accouché au centre

Le backend doit donc accepter des parcours incomplets ou externes tout en gardant la cohérence des données.

---

## 8. Règles Git du projet

Le travail d’équipe suit les règles suivantes :

- **pas de push direct sur `main`**
- le travail se fait sur **`dev`**
- chaque fonctionnalité se développe sur une **branche dédiée**
- toute intégration se fait par **Pull Request vers `dev`**
- le **merge** n’est autorisé **qu’après validation d’au moins 3 membres**

### Flux Git recommandé
- `main` : branche stable / production
- `dev` : branche d’intégration
- `feature/...` : branche de développement d’une fonctionnalité
- `fix/...` : branche de correction
- `refactor/...` : branche de réorganisation technique

---

## 9. Méthode de développement backend

Chaque module backend doit être traité dans cet ordre :

1. module
2. analyse métier
3. acteurs
4. données à gérer
5. règles métier
6. entités
7. DTO
8. service
9. contrôleur
10. endpoints
11. validation
12. issues

Le backend doit toujours être développé en respectant :
- la logique métier réelle
- la cohérence avec le frontend existant
- la réutilisabilité
- la clarté des responsabilités

---

## 10. Structure générale du backend

```bash
src/
├── common/
├── config/
├── database/
├── modules/
│   ├── auth/
│   ├── users/
│   ├── roles/
│   ├── patientes/
│   ├── grossesses/
│   ├── cpn/
│   ├── accouchements/
│   ├── cps-femme/
│   ├── enfants/
│   ├── suivi-enfant/
│   ├── vaccination/
│   ├── rendez-vous/
│   ├── dossiers/
│   ├── laboratoire/
│   ├── pharmacie/
│   ├── impressions/
│   └── dashboard/
├── app.module.ts
└── main.ts