/**
 * Tests unitaires — AccouchementsService
 * Couvre : enregistrement, modification, obtention, suppression, règles métier.
 */

import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccouchementsService } from './accouchements.service';
import { AccouchementEntity } from './entities/accouchement.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { JournalService } from '../journal/journal.service';
import {
  mockRepository,
  MockRepository,
  mockJournalService,
  patienteFixture,
  dossierCpnFixture,
  accouchementFixture,
} from '../../test-utils';

describe('AccouchementsService', () => {
  let service: AccouchementsService;
  let accouchementsRepo: MockRepository<AccouchementEntity>;
  let patientesRepo: MockRepository<PatienteEntity>;
  let dossiersCpnRepo: MockRepository<DossierCpnEntity>;
  let dossiersCpsFemmeRepo: MockRepository<DossierCpsFemmeEntity>;
  let dossiersCpsEnfantRepo: MockRepository<DossierCpsEnfantEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccouchementsService,
        { provide: getRepositoryToken(AccouchementEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(PatienteEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpsFemmeEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpsEnfantEntity), useFactory: mockRepository },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<AccouchementsService>(AccouchementsService);
    accouchementsRepo = module.get(getRepositoryToken(AccouchementEntity));
    patientesRepo = module.get(getRepositoryToken(PatienteEntity));
    dossiersCpnRepo = module.get(getRepositoryToken(DossierCpnEntity));
    dossiersCpsFemmeRepo = module.get(getRepositoryToken(DossierCpsFemmeEntity));
    dossiersCpsEnfantRepo = module.get(getRepositoryToken(DossierCpsEnfantEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────
  // rechercherPatientes()
  // ─────────────────────────────────────────────

  describe('rechercherPatientes()', () => {
    it('TC-ACC-01 : doit retourner les patientes correspondant au terme de recherche', async () => {
      patientesRepo.find.mockResolvedValue([patienteFixture]);

      const resultat = await service.rechercherPatientes('Furaha');

      expect(resultat.patientes).toHaveLength(1);
      expect(resultat.patientes[0].numeroDossier).toBe('AFIA-20260101-0001');
    });

    it('TC-ACC-02 : doit retourner un tableau vide si le terme est trop court (< 2 caractères)', async () => {
      const resultat = await service.rechercherPatientes('F');

      expect(resultat.patientes).toHaveLength(0);
      expect(patientesRepo.find).not.toHaveBeenCalled();
    });

    it('TC-ACC-03 : doit retourner un tableau vide si aucune patiente ne correspond', async () => {
      patientesRepo.find.mockResolvedValue([]);

      const resultat = await service.rechercherPatientes('Xyzabc');

      expect(resultat.patientes).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────
  // listerAccouchements()
  // ─────────────────────────────────────────────

  describe('listerAccouchements()', () => {
    it('TC-ACC-04 : doit retourner la liste de tous les accouchements sans filtre', async () => {
      accouchementsRepo.find.mockResolvedValue([accouchementFixture]);

      const resultat = await service.listerAccouchements();

      expect(resultat.accouchements).toHaveLength(1);
    });

    it('TC-ACC-05 : doit retourner un tableau vide si aucune patiente correspond à la recherche', async () => {
      patientesRepo.find.mockResolvedValue([]);

      const resultat = await service.listerAccouchements('Fantome');

      expect(resultat.accouchements).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────
  // obtenirAccouchement()
  // ─────────────────────────────────────────────

  describe('obtenirAccouchement()', () => {
    it("TC-ACC-06 : doit retourner l'accouchement correspondant à l'id", async () => {
      accouchementsRepo.findOne.mockResolvedValue({
        ...accouchementFixture,
        patiente: patienteFixture,
        dossierCpn: dossierCpnFixture,
      });

      const resultat = await service.obtenirAccouchement('accouchement-uuid-001');

      expect(resultat.accouchement).toBeDefined();
      expect(resultat.accouchement.id).toBe('accouchement-uuid-001');
    });

    it("TC-ACC-07 : doit lever NotFoundException si l'accouchement est introuvable", async () => {
      accouchementsRepo.findOne.mockResolvedValue(null);

      await expect(service.obtenirAccouchement('id-fantome')).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // enregistrerAccouchement()
  // ─────────────────────────────────────────────

  describe('enregistrerAccouchement()', () => {
    const dtoBase = {
      patienteId: 'patiente-uuid-001',
      dateAccouchement: '2026-07-20',
      heureAccouchement: '14:30',
      modeAccouchement: 'VOIE_BASSE',
      issueNaissance: 'VIVANT',
      poidsNaissance: 3200,
      terme: 39,
      utilisateurNom: 'Amani Infirmière',
    };

    it("TC-ACC-08 : doit enregistrer un accouchement pour une patiente existante sans accouchement préalable ce jour", async () => {
      patientesRepo.findOne.mockResolvedValue(patienteFixture);
      dossiersCpnRepo.findOne.mockResolvedValue(null); // pas de dossier CPN à fermer
      accouchementsRepo.create.mockReturnValue(accouchementFixture);
      accouchementsRepo.save.mockResolvedValue(accouchementFixture);
      // Rechargement final avec relations
      accouchementsRepo.findOne.mockResolvedValueOnce({ ...accouchementFixture, patiente: patienteFixture });

      const resultat = await service.enregistrerAccouchement(dtoBase as any);

      expect(resultat).toHaveProperty('accouchement');
      expect(accouchementsRepo.save).toHaveBeenCalledTimes(1);
    });

    it('TC-ACC-09 : doit rejeter si la patiente est introuvable — NotFoundException', async () => {
      patientesRepo.findOne.mockResolvedValue(null);

      await expect(service.enregistrerAccouchement(dtoBase as any)).rejects.toThrow(NotFoundException);
    });

    it('TC-ACC-10 : doit rejeter si le dossier CPN est déjà lié à un autre accouchement — ConflictException', async () => {
      patientesRepo.findOne.mockResolvedValue(patienteFixture);
      // Doublon : dossierCpnId déjà lié à un autre accouchement
      accouchementsRepo.findOne.mockResolvedValueOnce(accouchementFixture);

      const dtoAvecDossierCpn = { ...dtoBase, dossierCpnId: dossierCpnFixture.id };
      await expect(service.enregistrerAccouchement(dtoAvecDossierCpn as any)).rejects.toThrow(ConflictException);
    });
  });
});
