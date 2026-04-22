# Documentation des Tests Unitaires — Projet Afia Himbi (CPN/CPS)

**Centre de Santé Afia Himbi — Goma, RDC**  
**Année académique 2025–2026**

---

## 1. Objectif des Tests Unitaires

Les tests unitaires ont été écrits pour vérifier le comportement de la **logique métier du backend** (NestJS) de manière isolée, c'est-à-dire sans dépendre de la base de données réelle ni d'API externes.

Chaque test simule les dépendances (repositories TypeORM, services) à l'aide de **mocks Jest**, afin de tester uniquement la logique du service concerné.

---

## 2. Périmètre Couvert

| Fichier de test | Module | Service testé |
|---|---|---|
| `auth.service.spec.ts` | Authentification | `AuthService` |
| `cpn.service.spec.ts` | CPN | `CpnService` |

---

## 3. Environnement de Test

| Élément | Valeur |
|---|---|
| Framework de test | **Jest** (intégré à NestJS) |
| Librairie de test NestJS | `@nestjs/testing` |
| Mocking | `jest.fn()` — repositories TypeORM simulés |
| Commande d'exécution | `npm run test` |
| Commande avec couverture | `npm run test:cov` |

---

## 4. Tests du Module Authentification

**Fichier :** `src/modules/auth/auth.service.spec.ts`

### 4.1 Méthode `connexion()`

| Code | Description | Résultat attendu |
|---|---|---|
| TC-AUTH-01 | Connexion avec identifiant et mot de passe valides | Retourne `{ jeton, utilisateur }` |
| TC-AUTH-02 | Mot de passe incorrect | Lève `UnauthorizedException` |
| TC-AUTH-03 | Identifiant inexistant en base | Lève `UnauthorizedException` |
| TC-AUTH-04 | Compte utilisateur désactivé (`actif = false`) | Lève `ForbiddenException` |

### 4.2 Méthode `deconnexion()`

| Code | Description | Résultat attendu |
|---|---|---|
| TC-AUTH-05 | Utilisateur introuvable pour la déconnexion | Lève `NotFoundException` |
| TC-AUTH-06 | Déconnexion d'un utilisateur avec sessions actives | Ferme les sessions, retourne un message de confirmation |

### Stratégie de mock employée

```typescript
// Les repositories TypeORM sont remplacés par des objets Jest
const utilisateurMock = {
  id: 'uuid-test-001',
  identifiant: 'admin',
  motDePasseHash: 'pass1234',
  actif: true,
  role: { nom: 'SUPER_ADMIN' },
};

utilisateursRepository.findOne.mockResolvedValue(utilisateurMock);
```

---

## 5. Tests du Module CPN

**Fichier :** `src/modules/cpn/cpn.service.spec.ts`

### 5.1 Méthode `ouvrirDossier()`

| Code | Description | Résultat attendu |
|---|---|---|
| TC-CPN-01 | Ouverture d'un dossier CPN via `patienteId` (aucun dossier actif) | Retourne `{ dossier }` avec numéro généré |
| TC-CPN-02 | Ouverture via le numéro de dossier mère (`AFIA-...`) | Retourne `{ dossier }` correctement lié |
| TC-CPN-03 | Patiente introuvable en base | Lève `NotFoundException` |
| TC-CPN-04 | Dossier CPN ouvert existant pour la même patiente | Lève `ConflictException` |
| TC-CPN-05 | Ni `patienteId` ni `numeroDossierMere` fournis | Lève `NotFoundException` |

### 5.2 Méthode `modifierDossier()`

| Code | Description | Résultat attendu |
|---|---|---|
| TC-CPN-06 | Modification des notes d'un dossier existant | Retourne un message de succès, `save()` appelé |
| TC-CPN-07 | Clôture du dossier avec `statut = CLOS` | Dossier est enregistré avec `dateCloture` renseignée |
| TC-CPN-08 | Dossier à modifier inexistant | Lève `NotFoundException` |

### 5.3 Méthode `obtenirDossier()`

| Code | Description | Résultat attendu |
|---|---|---|
| TC-CPN-09 | Lecture d'un dossier existant avec contacts et examens | Retourne `{ dossier }` complet |
| TC-CPN-10 | Dossier inexistant | Lève `NotFoundException` |

### Stratégie de mock employée

Tous les repositories TypeORM (`DossierCpnEntity`, `PatienteEntity`, etc.) sont remplacés par des mocks, et le `JournalService` est simulé pour éviter d'appeler la base de données lors des tests :

```typescript
const mockJournalService = {
  enregistrer: jest.fn().mockResolvedValue(undefined),
};
```

---

## 6. Comment Exécuter les Tests

### Tous les tests
```bash
cd cpn-cps-nestjs
npm run test
```

### Uniquement les tests d'authentification
```bash
npm run test -- auth.service.spec
```

### Uniquement les tests CPN
```bash
npm run test -- cpn.service.spec
```

### Avec rapport de couverture de code
```bash
npm run test:cov
```

Le rapport de couverture est généré dans le dossier `coverage/` et indique le pourcentage de lignes, branches et fonctions couvertes par les tests.

---

## 7. Résultats Attendus

Lors de l'exécution, Jest doit afficher :

```
PASS src/modules/auth/auth.service.spec.ts
  AuthService
    connexion()
      ✓ TC-AUTH-01 : doit connecter un utilisateur avec des identifiants valides
      ✓ TC-AUTH-02 : doit rejeter un mot de passe incorrect avec UnauthorizedException
      ✓ TC-AUTH-03 : doit rejeter si l'identifiant n'existe pas
      ✓ TC-AUTH-04 : doit rejeter un compte désactivé avec ForbiddenException
    deconnexion()
      ✓ TC-AUTH-05 : doit lever NotFoundException si l'utilisateur est introuvable
      ✓ TC-AUTH-06 : doit fermer les sessions actives pour un utilisateur connu

PASS src/modules/cpn/cpn.service.spec.ts
  CpnService
    ouvrirDossier()
      ✓ TC-CPN-01 : doit ouvrir un dossier CPN pour une patiente existante sans dossier actif
      ✓ TC-CPN-02 : doit ouvrir un dossier via le numéro de dossier mère (AFIA-...)
      ✓ TC-CPN-03 : doit rejeter si la patiente est introuvable
      ✓ TC-CPN-04 : doit rejeter si un dossier CPN ouvert existe déjà pour cette patiente
      ✓ TC-CPN-05 : doit rejeter si ni patienteId ni numeroDossierMere ne sont fournis
    modifierDossier()
      ✓ TC-CPN-06 : doit modifier les données obstétricales d'un dossier existant
      ✓ TC-CPN-07 : doit clore un dossier CPN avec statut CLOS
      ✓ TC-CPN-08 : doit rejeter si le dossier à modifier est introuvable
    obtenirDossier()
      ✓ TC-CPN-09 : doit retourner un dossier existant avec ses contacts et examens
      ✓ TC-CPN-10 : doit rejeter si le dossier est introuvable

Test Suites: 2 passed, 2 total
Tests:       16 passed, 16 total
```

---

## 8. Ce qui n'est PAS testé (périmètre exclu)

| Élément | Raison |
|---|---|
| Base de données réelle | Tests unitaires — pas d'accès à MySQL |
| API OpenAI (analyse IA) | Dépendance externe, testée séparément en intégration |
| Controllers | Testés via les tests end-to-end (e2e) |
| Frontend React | Périmètre séparé (tests Vitest / React Testing Library) |

---

**Centre de Santé Afia Himbi — Goma, République Démocratique du Congo**  
**Année académique 2025–2026**
