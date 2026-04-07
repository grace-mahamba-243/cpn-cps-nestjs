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