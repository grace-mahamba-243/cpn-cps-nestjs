// Mock OpenAI AVANT tout import pour éviter l'erreur "Missing credentials"
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'Analyse IA simulée.' } }],
        }),
      },
    },
  })),
}));

// Tests unitaires du service CPS Femme (suivi postnatal de la mère)
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CpsFemmeService } from './cps-femme.service';
import { DossierCpsFemmeEntity } from './entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from './entities/visite-cps-femme.entity';
import { ExamenCpsFemmeEntity } from './entities/examen-cps-femme.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { ExamenCpnEntity } from '../cpn/entities/examen-cpn.entity';
import { EnfantEntity } from '../enfants/entities/enfant.entity';
import { RendezVousEntity } from '../rendez-vous/entities/rendez-vous.entity';
import { JournalService } from '../journal/journal.service';
import { mockRepository, mockJournalService, patienteFixture, dossierCpnFixture } from '../../test-utils';

// Fixture pour un dossier CPS Femme
const dossierCpsFemmeFixture = {
  id: 'dossier-cps-femme-uuid-001',
  numeroDossierCps: 'CPS-2024-001',
  patienteId: patienteFixture.id,
  dossierCpnId: dossierCpnFixture.id,
  statut: 'OUVERT',
  dateOuverture: '2024-01-10',
  patiente: patienteFixture,
  visites: [],
  creeLe: new Date('2024-01-10'),
};

const dossierCpsFemmeClosFixture = {
  ...dossierCpsFemmeFixture,
  id: 'dossier-cps-femme-uuid-002',
  statut: 'CLOS',
  dateCloture: '2024-02-10',
};

describe('CpsFemmeService', () => {
  let service: CpsFemmeService;
  let dossiersRepo: ReturnType<typeof mockRepository>;
  let visitesRepo: ReturnType<typeof mockRepository>;
  let patientesRepo: ReturnType<typeof mockRepository>;
  let dossiersCpnRepo: ReturnType<typeof mockRepository>;
  let contactsCpnRepo: ReturnType<typeof mockRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CpsFemmeService,
        { provide: getRepositoryToken(DossierCpsFemmeEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(VisiteCpsFemmeEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(PatienteEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(DossierCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ContactCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ExamenCpnEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(EnfantEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(ExamenCpsFemmeEntity), useValue: mockRepository() },
        { provide: getRepositoryToken(RendezVousEntity), useValue: mockRepository() },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<CpsFemmeService>(CpsFemmeService);
    dossiersRepo = module.get(getRepositoryToken(DossierCpsFemmeEntity));
    visitesRepo = module.get(getRepositoryToken(VisiteCpsFemmeEntity));
    patientesRepo = module.get(getRepositoryToken(PatienteEntity));
    dossiersCpnRepo = module.get(getRepositoryToken(DossierCpnEntity));
    contactsCpnRepo = module.get(getRepositoryToken(ContactCpnEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // --- TC-CPS-01: Recherche de patientes avec un terme valide ---
  it('TC-CPS-01: rechercherPatientes - doit retourner une liste de patientes', async () => {
    patientesRepo.find.mockResolvedValueOnce([patienteFixture]);

    const result = await service.rechercherPatientes('Marie');

    expect(patientesRepo.find).toHaveBeenCalled();
    expect(result.patientes).toHaveLength(1);
    expect(result.patientes[0].id).toBe(patienteFixture.id);
  });

  // --- TC-CPS-02: Recherche avec un terme trop court ---
  it('TC-CPS-02: rechercherPatientes - terme trop court doit retourner liste vide', async () => {
    const result = await service.rechercherPatientes('M');

    expect(patientesRepo.find).not.toHaveBeenCalled();
    expect(result.patientes).toHaveLength(0);
  });

  // --- TC-CPS-03: Ouverture de dossier CPS avec succès ---
  it('TC-CPS-03: ouvrirDossier - doit créer un dossier CPS avec succès', async () => {
    patientesRepo.findOne.mockResolvedValueOnce(patienteFixture);
    dossiersRepo.findOne
      .mockResolvedValueOnce(null) // pas de dossier existant ouvert
      .mockResolvedValueOnce({ ...dossierCpsFemmeFixture, patiente: patienteFixture }); // reload après save
    dossiersRepo.create.mockReturnValueOnce(dossierCpsFemmeFixture);
    dossiersRepo.save.mockResolvedValueOnce(dossierCpsFemmeFixture);

    const dto = {
      patienteId: patienteFixture.id,
      dateOuverture: '2024-01-10',
      typeAccouchementEntree: 'NORMAL',
      etatMereEntree: 'BON',
      etatNouveauNe: 'VIF',
      dateAccouchement: '2024-01-09',
      modeAccouchement: 'VOIE_BASSE',
      utilisateurId: 'user-001',
      utilisateurNom: 'Dr. Test',
    };

    const result = await service.ouvrirDossier(dto as any);

    expect(patientesRepo.findOne).toHaveBeenCalledWith({ where: { id: dto.patienteId } });
    expect(dossiersRepo.save).toHaveBeenCalled();
    expect(result.message).toContain('succes');
  });

  // --- TC-CPS-04: Ouverture dossier - patiente introuvable ---
  it('TC-CPS-04: ouvrirDossier - doit lever NotFoundException si patiente inconnue', async () => {
    patientesRepo.findOne.mockResolvedValueOnce(null);

    await expect(
      service.ouvrirDossier({ patienteId: 'id-inexistant' } as any),
    ).rejects.toThrow(NotFoundException);
  });

  // --- TC-CPS-05: Ouverture dossier - dossier CPS déjà ouvert ---
  it('TC-CPS-05: ouvrirDossier - doit lever ConflictException si dossier CPS déjà ouvert', async () => {
    patientesRepo.findOne.mockResolvedValueOnce(patienteFixture);
    dossiersRepo.findOne.mockResolvedValueOnce(dossierCpsFemmeFixture); // dossier existant ouvert

    await expect(
      service.ouvrirDossier({ patienteId: patienteFixture.id } as any),
    ).rejects.toThrow(ConflictException);
  });

  // --- TC-CPS-06: Obtenir un dossier existant ---
  it('TC-CPS-06: obtenirDossier - doit retourner le dossier avec son historique', async () => {
    dossiersRepo.findOne.mockResolvedValueOnce({ ...dossierCpsFemmeFixture, visites: [], patiente: patienteFixture });
    dossiersCpnRepo.findOne.mockResolvedValueOnce(null);
    dossiersCpnRepo.find.mockResolvedValueOnce([]);
    dossiersRepo.find.mockResolvedValueOnce([]);

    const result = await service.obtenirDossier(dossierCpsFemmeFixture.id);

    expect(dossiersRepo.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: dossierCpsFemmeFixture.id } }));
    expect(result.dossier).toBeDefined();
  });

  // --- TC-CPS-07: Obtenir un dossier inexistant ---
  it('TC-CPS-07: obtenirDossier - doit lever NotFoundException si dossier introuvable', async () => {
    dossiersRepo.findOne.mockResolvedValueOnce(null);

    await expect(service.obtenirDossier('id-inexistant')).rejects.toThrow(NotFoundException);
  });

  // --- TC-CPS-08: Clôture d'un dossier CPS ouvert ---
  it('TC-CPS-08: cloturerDossier - doit clôturer un dossier ouvert avec succès', async () => {
    const dossierOuvert = { ...dossierCpsFemmeFixture };
    dossiersRepo.findOne.mockResolvedValueOnce(dossierOuvert);
    dossiersRepo.save.mockResolvedValueOnce({ ...dossierOuvert, statut: 'CLOS' });

    const result = await service.cloturerDossier(dossierOuvert.id, {
      closPar: 'Dr. Test',
      utilisateurId: 'user-001',
      utilisateurNom: 'Dr. Test',
    });

    expect(dossiersRepo.save).toHaveBeenCalled();
    expect(result.message).toBeDefined();
  });

  // --- TC-CPS-09: Clôture d'un dossier déjà clos ---
  it('TC-CPS-09: cloturerDossier - doit lever BadRequestException si dossier déjà clos', async () => {
    dossiersRepo.findOne.mockResolvedValueOnce(dossierCpsFemmeClosFixture);

    await expect(
      service.cloturerDossier(dossierCpsFemmeClosFixture.id, { closPar: 'Dr. Test' }),
    ).rejects.toThrow();
  });

  // --- TC-CPS-10: Lister les visites d'un dossier ---
  it('TC-CPS-10: listerVisites - doit retourner la liste des visites du dossier', async () => {
    dossiersRepo.findOne.mockResolvedValueOnce(dossierCpsFemmeFixture);
    visitesRepo.find.mockResolvedValueOnce([]);

    const result = await service.listerVisites(dossierCpsFemmeFixture.id);

    expect(dossiersRepo.findOne).toHaveBeenCalledWith({
      where: { id: dossierCpsFemmeFixture.id },
    });
    expect(result).toBeDefined();
  });
});
