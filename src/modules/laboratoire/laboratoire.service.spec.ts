// Tests unitaires du service Laboratoire (gestion des demandes et résultats d'examens biologiques)
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LaboratoireService } from './laboratoire.service';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenEnfantEntity } from '../enfants/entities/examen-enfant.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { ExamenCpsFemmeEntity } from '../cps-femme/entities/examen-cps-femme.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { ExamenCpsEnfantEntity } from '../cps-enfant/entities/examen-cps-enfant.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { JournalService } from '../journal/journal.service';
import { mockRepository, mockJournalService, dossierCpnFixture, contactCpnFixture } from '../../test-utils';

// Fixture pour un examen CPN en attente
const examenCpnFixture = {
  id: 'examen-cpn-uuid-001',
  libelle: 'Glycémie à jeun',
  typeExamen: 'BIOLOGIQUE',
  statut: 'DEMANDE',
  dossierId: dossierCpnFixture.id,
  contactId: contactCpnFixture.id,
  creeLe: new Date('2024-01-15'),
  dossier: dossierCpnFixture,
};

const examenEnCoursFixture = {
  ...examenCpnFixture,
  id: 'examen-cpn-uuid-002',
  statut: 'EN_COURS',
  prisEnChargeLe: new Date('2024-01-16'),
};

describe('LaboratoireService', () => {
  let service: LaboratoireService;
  let examensRepo: ReturnType<typeof mockRepository>;
  let examensEnfantsRepo: ReturnType<typeof mockRepository>;
  let examensCpsFemmeRepo: ReturnType<typeof mockRepository>;
  let examensCpsEnfantRepo: ReturnType<typeof mockRepository>;
  let dossiersRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LaboratoireService,
        { provide: getRepositoryToken(ExamenCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(DossierCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ContactCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ExamenEnfantEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(EnfantEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ExamenCpsFemmeEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(DossierCpsFemmeEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ExamenCpsEnfantEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(DossierCpsEnfantEntity), useValue: mockRepository() },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<LaboratoireService>(LaboratoireService);
    examensRepo = module.get(getRepositoryToken(ExamenCpnEntity));
    examensEnfantsRepo = module.get(getRepositoryToken(ExamenEnfantEntity));
    examensCpsFemmeRepo = module.get(getRepositoryToken(ExamenCpsFemmeEntity));
    examensCpsEnfantRepo = module.get(getRepositoryToken(ExamenCpsEnfantEntity));
    dossiersRepo = module.get(getRepositoryToken(DossierCpnEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // Helpers pour mockResolvedValue sur les 4 repos find() appelés en Promise.all
  const mockAllReposFind = (...mocks: [any[], any[], any[], any[]]) => {
    examensRepo.find.mockResolvedValueOnce(mocks[0]);
    examensEnfantsRepo.find.mockResolvedValueOnce(mocks[1]);
    examensCpsFemmeRepo.find.mockResolvedValueOnce(mocks[2]);
    examensCpsEnfantRepo.find.mockResolvedValueOnce(mocks[3]);
  };

  // --- TC-LAB-01: Lister les demandes en attente avec résultats ---
  it('TC-LAB-01: listerDemandesEnAttente - doit retourner les examens CPN en statut DEMANDE', async () => {
    // Les 4 repos sont interrogés en parallèle (Promise.all)
    // Chaque enrichir* appelle findOne sur dossiersRepo/contactsRepo
    examensRepo.find.mockResolvedValueOnce([examenCpnFixture]);
    examensEnfantsRepo.find.mockResolvedValueOnce([]);
    examensCpsFemmeRepo.find.mockResolvedValueOnce([]);
    examensCpsEnfantRepo.find.mockResolvedValueOnce([]);
    dossiersRepo.findOne.mockResolvedValue(dossierCpnFixture);

    const result = await service.listerDemandesEnAttente();

    expect(examensRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ statut: 'DEMANDE' }) }),
    );
    expect(result.demandes).toBeDefined();
    expect(Array.isArray(result.demandes)).toBe(true);
  });

  // --- TC-LAB-02: Lister les demandes en attente - résultat vide ---
  it('TC-LAB-02: listerDemandesEnAttente - doit retourner liste vide si aucune demande', async () => {
    mockAllReposFind([], [], [], []);

    const result = await service.listerDemandesEnAttente();

    expect(result.demandes).toHaveLength(0);
  });

  // --- TC-LAB-03: Lister les demandes en cours ---
  it('TC-LAB-03: listerDemandesEnCours - doit retourner les examens en statut EN_COURS', async () => {
    examensRepo.find.mockResolvedValueOnce([examenEnCoursFixture]);
    examensEnfantsRepo.find.mockResolvedValueOnce([]);
    examensCpsFemmeRepo.find.mockResolvedValueOnce([]);
    examensCpsEnfantRepo.find.mockResolvedValueOnce([]);
    dossiersRepo.findOne.mockResolvedValue(dossierCpnFixture);

    const result = await service.listerDemandesEnCours();

    expect(examensRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ statut: 'EN_COURS' }) }),
    );
    expect(result.demandes).toBeDefined();
  });

  // --- TC-LAB-04: Obtenir une demande existante ---
  it('TC-LAB-04: obtenirDemande - doit retourner la demande CPN si elle existe', async () => {
    examensRepo.findOne.mockResolvedValueOnce(examenCpnFixture);
    dossiersRepo.findOne.mockResolvedValue(dossierCpnFixture);

    const result = await service.obtenirDemande(examenCpnFixture.id);

    expect(examensRepo.findOne).toHaveBeenCalledWith({ where: { id: examenCpnFixture.id } });
    expect(result.demande).toBeDefined();
  });

  // --- TC-LAB-05: Obtenir une demande inexistante ---
  it('TC-LAB-05: obtenirDemande - doit lever NotFoundException si examen introuvable dans tous les repos', async () => {
    examensRepo.findOne.mockResolvedValueOnce(null);
    examensEnfantsRepo.findOne.mockResolvedValueOnce(null);
    examensCpsFemmeRepo.findOne.mockResolvedValueOnce(null);
    examensCpsEnfantRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.obtenirDemande('id-inexistant')).rejects.toThrow(NotFoundException);
  });

  // --- TC-LAB-06: Prise en charge d'un examen CPN en attente ---
  it('TC-LAB-06: prendreEnCharge - doit passer l examen CPN en statut EN_COURS', async () => {
    const examenCopie = { ...examenCpnFixture };
    examensRepo.findOne.mockResolvedValueOnce(examenCopie);
    examensRepo.save.mockResolvedValueOnce({ ...examenCopie, statut: 'EN_COURS' });
    dossiersRepo.findOne.mockResolvedValue(dossierCpnFixture);

    const dto = { utilisateurId: 'user-001', utilisateurNom: 'Dr. Lab' };
    const result = await service.prendreEnCharge(examenCpnFixture.id, dto as any);

    expect(examensRepo.save).toHaveBeenCalled();
    expect(result.message).toContain('succes');
  });

  // --- TC-LAB-07: Prise en charge - examen déjà en cours ---
  it('TC-LAB-07: prendreEnCharge - doit lever BadRequestException si examen déjà en cours', async () => {
    examensRepo.findOne.mockResolvedValueOnce(examenEnCoursFixture);

    await expect(
      service.prendreEnCharge(examenEnCoursFixture.id, {} as any),
    ).rejects.toThrow(BadRequestException);
  });

  // --- TC-LAB-08: Lister l'historique des examens biologiques terminés ---
  it('TC-LAB-08: listerHistorique - doit retourner les examens CPN avec statut RESULTAT_ENVOYE', async () => {
    const examenTermine = { ...examenCpnFixture, statut: 'RESULTAT_ENVOYE', envoyeLe: new Date() };
    examensRepo.find.mockResolvedValueOnce([examenTermine]);
    examensEnfantsRepo.find.mockResolvedValueOnce([]);
    dossiersRepo.findOne.mockResolvedValue(dossierCpnFixture);

    const result = await service.listerHistorique();

    expect(examensRepo.find).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ statut: expect.anything() }) }),
    );
    expect(result.demandes).toBeDefined();
  });
});
