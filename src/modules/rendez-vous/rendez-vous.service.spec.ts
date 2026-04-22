/**
 * Tests unitaires — RendezVousService
 * Couvre : findOne, creer (succès et doublon), mettreAJourStatut, findAll.
 */

import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RendezVousService } from './rendez-vous.service';
import { RendezVousEntity } from './entities/rendez-vous.entity';
import { DossierCpnEntity } from '../cpn/entities/dossier-cpn.entity';
import { ContactCpnEntity } from '../cpn/entities/contact-cpn.entity';
import { DossierCpsFemmeEntity } from '../cps-femme/entities/dossier-cps-femme.entity';
import { VisiteCpsFemmeEntity } from '../cps-femme/entities/visite-cps-femme.entity';
import { DossierCpsEnfantEntity } from '../cps-enfant/entities/dossier-cps-enfant.entity';
import { VisiteCpsEnfantEntity } from '../cps-enfant/entities/visite-cps-enfant.entity';
import { JournalService } from '../journal/journal.service';
import {
  mockRepository,
  MockRepository,
  mockJournalService,
  rendezVousFixture,
  patienteFixture,
} from '../../test-utils';

describe('RendezVousService', () => {
  let service: RendezVousService;
  let rendezVousRepository: MockRepository<RendezVousEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RendezVousService,
        { provide: getRepositoryToken(RendezVousEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(ContactCpnEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpsFemmeEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(VisiteCpsFemmeEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(DossierCpsEnfantEntity), useFactory: mockRepository },
        { provide: getRepositoryToken(VisiteCpsEnfantEntity), useFactory: mockRepository },
        { provide: JournalService, useValue: mockJournalService },
      ],
    }).compile();

    service = module.get<RendezVousService>(RendezVousService);
    rendezVousRepository = module.get(getRepositoryToken(RendezVousEntity));
  });

  afterEach(() => jest.clearAllMocks());

  // ─────────────────────────────────────────────
  // findOne()
  // ─────────────────────────────────────────────

  describe('findOne()', () => {
    it('TC-RDV-01 : doit retourner le rendez-vous correspondant à l\'id', async () => {
      rendezVousRepository.findOne.mockResolvedValue(rendezVousFixture);

      const resultat = await service.findOne('rdv-uuid-001');

      expect(resultat.id).toBe('rdv-uuid-001');
      expect(resultat.statut).toBe('PROGRAMME');
    });

    it('TC-RDV-02 : doit lever NotFoundException si le rendez-vous est introuvable', async () => {
      rendezVousRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-fantome')).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // creer()
  // ─────────────────────────────────────────────

  describe('creer()', () => {
    const dtoBase = {
      dateRdv: '2026-08-15',
      heureRdv: '09:00',
      motif: 'CPN2',
      nomPatient: 'Furaha Amani',
      initialesPatient: 'FA',
      refDossier: 'CPN-2026-0001',
      serviceDestination: 'Maternite (CPN)',
      utilisateurNom: 'Réceptionniste',
    };

    it('TC-RDV-03 : doit créer un rendez-vous sans doublon', async () => {
      // Pas de doublon
      rendezVousRepository.findOne.mockResolvedValue(null);
      rendezVousRepository.create.mockReturnValue(rendezVousFixture);
      rendezVousRepository.save.mockResolvedValue(rendezVousFixture);

      const resultat = await service.creer(dtoBase as any);

      expect(resultat.id).toBe('rdv-uuid-001');
      expect(rendezVousRepository.save).toHaveBeenCalledTimes(1);
    });

    it('TC-RDV-04 : doit rejeter si un rendez-vous actif existe déjà ce jour — ConflictException', async () => {
      // Doublon détecté
      rendezVousRepository.findOne.mockResolvedValue(rendezVousFixture);

      await expect(service.creer(dtoBase as any)).rejects.toThrow(ConflictException);
    });

    it('TC-RDV-05 : doit créer un rendez-vous sans refDossier (passage surprise)', async () => {
      const dtoSurprise = { ...dtoBase, refDossier: undefined, dateRdv: undefined };
      rendezVousRepository.create.mockReturnValue({ ...rendezVousFixture, typeRdv: 'SURPRISE' });
      rendezVousRepository.save.mockResolvedValue({ ...rendezVousFixture, typeRdv: 'SURPRISE' });

      const resultat = await service.creer(dtoSurprise as any);

      // Aucune vérification de doublon car refDossier absent
      expect(rendezVousRepository.findOne).not.toHaveBeenCalled();
      expect(resultat).toBeDefined();
    });
  });

  // ─────────────────────────────────────────────
  // mettreAJourStatut()
  // ─────────────────────────────────────────────

  describe('mettreAJourStatut()', () => {
    it('TC-RDV-06 : doit mettre à jour le statut vers ARRIVE', async () => {
      rendezVousRepository.findOne
        .mockResolvedValueOnce(rendezVousFixture) // findOne dans mettreAJourStatut
      rendezVousRepository.save.mockResolvedValue({ ...rendezVousFixture, statut: 'ARRIVE' });

      const resultat = await service.mettreAJourStatut('rdv-uuid-001', {
        statut: 'ARRIVE',
        utilisateurNom: 'Réceptionniste',
      } as any);

      expect(resultat.statut).toBe('ARRIVE');
      expect(rendezVousRepository.save).toHaveBeenCalledTimes(1);
    });

    it('TC-RDV-07 : doit lever NotFoundException si le rendez-vous à mettre à jour est introuvable', async () => {
      rendezVousRepository.findOne.mockResolvedValue(null);

      await expect(
        service.mettreAJourStatut('id-fantome', { statut: 'ARRIVE' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // findAll()
  // ─────────────────────────────────────────────

  describe('findAll()', () => {
    it('TC-RDV-08 : doit retourner la liste de tous les rendez-vous sans filtre', async () => {
      rendezVousRepository.find.mockResolvedValue([rendezVousFixture]);

      const resultat = await service.findAll();

      expect(resultat).toHaveLength(1);
      expect(resultat[0].id).toBe('rdv-uuid-001');
    });

    it('TC-RDV-09 : doit retourner un tableau vide si aucun rendez-vous existe', async () => {
      rendezVousRepository.find.mockResolvedValue([]);

      const resultat = await service.findAll();

      expect(resultat).toHaveLength(0);
    });
  });
});
