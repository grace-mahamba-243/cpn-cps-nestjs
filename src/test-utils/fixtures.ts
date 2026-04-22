/**
 * Fixtures partagées — jeux de données réutilisables dans tous les tests.
 * Représentent des entités "valides" typiques du domaine médical Afia Himbi.
 */

// ─────────────────────────────────────────────────────────────
// Rôles
// ─────────────────────────────────────────────────────────────
export const roleAdminFixture = {
  id: 'role-uuid-admin',
  code: 'ADMIN',
  libelle: 'Administrateur',
};

export const roleMedecinFixture = {
  id: 'role-uuid-medecin',
  code: 'MEDECIN',
  libelle: 'Médecin',
};

export const roleInfirmiereFixture = {
  id: 'role-uuid-infirmiere',
  code: 'INFIRMIERE',
  libelle: 'Infirmière',
};

export const roleSuperAdminFixture = {
  id: 'role-uuid-super',
  code: 'SUPER_ADMIN',
  libelle: 'Super Administrateur',
};

// ─────────────────────────────────────────────────────────────
// Utilisateurs
// ─────────────────────────────────────────────────────────────
export const utilisateurAdminFixture = {
  id: 'user-uuid-001',
  identifiant: 'admin',
  nomAffichage: 'Super Administrateur',
  motDePasseHash: 'pass1234',
  actif: true,
  doitChangerMotDePasse: false,
  dernierAccesAt: null,
  role: roleSuperAdminFixture,
};

export const utilisateurMedecinFixture = {
  id: 'user-uuid-002',
  identifiant: 'dr.mutombo',
  nomAffichage: 'Dr Mutombo',
  motDePasseHash: 'medpass',
  actif: true,
  doitChangerMotDePasse: false,
  dernierAccesAt: null,
  role: roleMedecinFixture,
};

export const utilisateurInfirmiereFixture = {
  id: 'user-uuid-003',
  identifiant: 'inf.amani',
  nomAffichage: 'Amani Infirmière',
  motDePasseHash: 'inf1234',
  actif: true,
  doitChangerMotDePasse: false,
  dernierAccesAt: null,
  role: roleInfirmiereFixture,
};

// ─────────────────────────────────────────────────────────────
// Patientes
// ─────────────────────────────────────────────────────────────
export const patienteFixture = {
  id: 'patiente-uuid-001',
  numeroDossier: 'AFIA-20260101-0001',
  nom: 'Furaha',
  postnom: 'Amani',
  prenom: 'Marie',
  dateNaissance: '1995-03-15',
  telephone: '+243 990 000 001',
  adresse: 'Quartier Himbi, Goma',
  groupeSanguin: 'A+',
  vihStatut: 'NEGATIF',
  actif: true,
};

export const patienteDeuxiemeFixture = {
  id: 'patiente-uuid-002',
  numeroDossier: 'AFIA-20260101-0002',
  nom: 'Bahati',
  postnom: 'Mapendo',
  prenom: 'Christine',
  dateNaissance: '1998-07-20',
  telephone: '+243 990 000 002',
  adresse: 'Quartier Virunga, Goma',
  groupeSanguin: 'O+',
  vihStatut: 'INCONNU',
  actif: true,
};

// ─────────────────────────────────────────────────────────────
// Dossiers CPN
// ─────────────────────────────────────────────────────────────
export const dossierCpnFixture = {
  id: 'dossier-cpn-uuid-001',
  numeroDossierCpn: 'CPN-2026-0001',
  patienteId: 'patiente-uuid-001',
  patiente: patienteFixture,
  statut: 'OUVERT',
  dateOuverture: '2026-01-10',
  gestite: 2,
  parite: 1,
  nombreAvortements: 0,
  derniersRegles: '2025-10-15',
  dateProbableAccouchement: '2026-07-22',
  ageGestionnelOuverture: 12,
  vihStatut: 'NEGATIF',
  contacts: [],
  examens: [],
  enregistrePar: 'Amani Infirmière',
  creeLe: '2026-01-10T08:00:00.000Z',
};

// ─────────────────────────────────────────────────────────────
// Contacts CPN
// ─────────────────────────────────────────────────────────────
export const contactCpnFixture = {
  id: 'contact-cpn-uuid-001',
  dossierCpnId: 'dossier-cpn-uuid-001',
  numeroContact: 1,
  dateContact: '2026-01-10',
  ageGestationnel: 12,
  poids: 58.5,
  tensionSystolique: 110,
  tensionDiastolique: 70,
  temperature: 36.8,
  hauteurUterine: 12,
  bfc: 140,
  presentationFoetale: 'Sommet',
  mouvementsActifs: true,
  oedemes: false,
  paleur: false,
  etatGeneral: 'Bon',
  observations: 'RAS',
  enregistrePar: 'Amani Infirmière',
};

// ─────────────────────────────────────────────────────────────
// Accouchements
// ─────────────────────────────────────────────────────────────
export const accouchementFixture = {
  id: 'accouchement-uuid-001',
  patienteId: 'patiente-uuid-001',
  patiente: patienteFixture,
  dossierCpnId: 'dossier-cpn-uuid-001',
  dateAccouchement: '2026-07-20',
  heureAccouchement: '14:30',
  modeAccouchement: 'VOIE_BASSE',
  issueNaissance: 'VIVANT',
  apgar1min: 8,
  apgar5min: 9,
  poidsNaissance: 3200,
  terme: 39,
  etatMere: 'Stable',
  etatNouveauNe: 'Bon',
  enregistrePar: 'Amani Infirmière',
  creeLe: '2026-07-20T14:35:00.000Z',
};

// ─────────────────────────────────────────────────────────────
// Enfants
// ─────────────────────────────────────────────────────────────
export const enfantFixture = {
  id: 'enfant-uuid-001',
  numeroDossier: 'ENF-20260720-0001',
  nom: 'Furaha',
  postnom: 'Junior',
  sexe: 'MASCULIN',
  dateNaissance: '2026-07-20',
  mereId: 'patiente-uuid-001',
  mere: patienteFixture,
  accouchementId: 'accouchement-uuid-001',
  poidsNaissance: 3200,
  actif: true,
};

// ─────────────────────────────────────────────────────────────
// Rendez-vous
// ─────────────────────────────────────────────────────────────
export const rendezVousFixture = {
  id: 'rdv-uuid-001',
  patienteId: 'patiente-uuid-001',
  patiente: patienteFixture,
  dateRendezVous: '2026-08-15',
  heureRendezVous: '09:00',
  motif: 'CPN2',
  statut: 'PROGRAMME',
  enregistrePar: 'Réceptionniste',
  creeLe: '2026-08-01T10:00:00.000Z',
};

// ─────────────────────────────────────────────────────────────
// Sessions
// ─────────────────────────────────────────────────────────────
export const sessionFixture = {
  id: 'session-uuid-001',
  jetonSession: 'jeton-test-abc123xyz',
  expireLe: new Date(Date.now() + 30 * 60 * 1000),
  estActive: true,
  revoqueeLe: null,
  utilisateur: utilisateurAdminFixture,
};

// ─────────────────────────────────────────────────────────────
// Examens de laboratoire
// ─────────────────────────────────────────────────────────────
export const examenLaboratoireFixture = {
  id: 'exam-labo-uuid-001',
  typeExamen: 'NFS',
  statut: 'EN_ATTENTE',
  module: 'CPN',
  dossierCpnId: 'dossier-cpn-uuid-001',
  patienteId: 'patiente-uuid-001',
  demandeParNom: 'Amani Infirmière',
  resultat: null,
  creeLe: '2026-01-10T09:00:00.000Z',
};
