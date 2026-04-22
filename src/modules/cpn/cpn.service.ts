import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository, Not, In } from 'typeorm';
import { DossierCpnEntity } from './entities/dossier-cpn.entity';
import { ContactCpnEntity } from './entities/contact-cpn.entity';
import { ExamenCpnEntity } from './entities/examen-cpn.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { AccouchementEntity } from '../accouchements/entities/accouchement.entity';
import { CreerDossierCpnDto } from './dto/creer-dossier-cpn.dto';
import { ModifierDossierCpnDto } from './dto/modifier-dossier-cpn.dto';
import { CreerContactCpnDto } from './dto/creer-contact-cpn.dto';
import { ModifierContactCpnDto } from './dto/modifier-contact-cpn.dto';
import { AnalyserContactCpnDto } from './dto/analyser-contact-cpn.dto';
import { CreerExamenCpnDto } from './dto/creer-examen-cpn.dto';
import { ModifierExamenCpnDto } from './dto/modifier-examen-cpn.dto';
import { JournalService } from '../journal/journal.service';
import { RendezVousEntity } from '../rendez-vous/entities/rendez-vous.entity';

// Ce service centralise toute la logique metier du module CPN.
@Injectable()
export class CpnService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  constructor(
    @InjectRepository(DossierCpnEntity)
    private readonly dossiersRepo: Repository<DossierCpnEntity>,
    @InjectRepository(ContactCpnEntity)
    private readonly contactsRepo: Repository<ContactCpnEntity>,
    @InjectRepository(ExamenCpnEntity)
    private readonly examensRepo: Repository<ExamenCpnEntity>,
    @InjectRepository(PatienteEntity)
    private readonly patientesRepo: Repository<PatienteEntity>,
    @InjectRepository(AccouchementEntity)
    private readonly accouchementsRepo: Repository<AccouchementEntity>,
    @InjectRepository(RendezVousEntity)
    private readonly rdvRepo: Repository<RendezVousEntity>,
    private readonly journalService: JournalService,
  ) {}

  // --- Dossiers CPN ---

  async listerDossiers(recherche?: string, patienteId?: string, statut?: string) {
    let dossiers: DossierCpnEntity[];

    if (patienteId) {
      const where: any = { patienteId };
      if (statut) where.statut = statut;
      dossiers = await this.dossiersRepo.find({
        where,
        relations: ['patiente', 'contacts'],
        order: { creeLe: 'DESC' },
      });
      return { dossiers: dossiers.map((d) => this.formaterDossierResume(d)) };
    }

    if (recherche && recherche.trim()) {
      const terme = recherche.trim();

      // Recherche directe par numéro de dossier CPN (ex: CPN-2026-0001), tous statuts inclus
      if (/^CPN-/i.test(terme) || /^\d{4}/.test(terme)) {
        const dossiersDirects = await this.dossiersRepo.find({
          where: { numeroDossierCpn: Like(`%${terme}%`) },
          relations: ['patiente', 'contacts'],
          order: { creeLe: 'DESC' },
        });
        if (dossiersDirects.length > 0) {
          return { dossiers: dossiersDirects.map((d) => this.formaterDossierResume(d)) };
        }
      }

      const patientes = await this.patientesRepo.find({
        where: [
          { nom: Like(`%${terme}%`) },
          { postnom: Like(`%${terme}%`) },
          { prenom: Like(`%${terme}%`) },
          { numeroDossier: Like(`%${terme}%`) },
          { telephone: Like(`%${terme}%`) },
        ],
      });
      const ids = patientes.map((p) => p.id);

      if (ids.length === 0) {
        return { dossiers: [] };
      }

      dossiers = await this.dossiersRepo
        .createQueryBuilder('d')
        .leftJoinAndSelect('d.patiente', 'p')
        .leftJoinAndSelect('d.contacts', 'c')
        .where('d.patiente_id IN (:...ids)', { ids })
        .orderBy('d.cree_le', 'DESC')
        .addOrderBy('c.numero_contact', 'DESC')
        .getMany();
    } else {
      dossiers = await this.dossiersRepo.find({
        relations: ['patiente', 'contacts'],
        order: { creeLe: 'DESC' },
      });
    }

    // Pour la liste principale : ne garder qu'un dossier par patiente
    // (le dossier OUVERT s'il existe, sinon le plus récent)
    const parPatiente = new Map<string, DossierCpnEntity>();
    for (const d of dossiers) {
      const existant = parPatiente.get(d.patienteId);
      if (!existant) {
        parPatiente.set(d.patienteId, d);
      } else if (d.statut === 'OUVERT' && existant.statut !== 'OUVERT') {
        // Préférer le dossier OUVERT
        parPatiente.set(d.patienteId, d);
      }
    }
    dossiers = Array.from(parPatiente.values());

    return { dossiers: dossiers.map((d) => this.formaterDossierResume(d)) };
  }

  async obtenirDossier(id: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['patiente', 'contacts', 'examens'],
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${id} introuvable.`);
    }

    dossier.contacts?.sort((a, b) => b.numeroContact - a.numeroContact);
    dossier.examens?.sort(
      (a, b) => new Date(b.creeLe).getTime() - new Date(a.creeLe).getTime(),
    );

    return { dossier: this.formaterDossierComplet(dossier) };
  }

  async ouvrirDossier(dto: CreerDossierCpnDto) {
    // Resoudre la patiente : priorite au numeroDossierMere (AFIA-...), sinon patienteId UUID
    let patiente: PatienteEntity | null = null;
    if (dto.numeroDossierMere) {
      patiente = await this.patientesRepo.findOne({ where: { numeroDossier: dto.numeroDossierMere } });
      if (!patiente) throw new NotFoundException(`Aucune patiente trouvée avec le dossier "${dto.numeroDossierMere}".`);
    } else if (dto.patienteId) {
      patiente = await this.patientesRepo.findOne({ where: { id: dto.patienteId } });
      if (!patiente) throw new NotFoundException('Patiente introuvable.');
    } else {
      throw new NotFoundException('Veuillez fournir numeroDossierMere ou patienteId.');
    }

    // Vérifier qu'il n'existe pas déjà un dossier OUVERT pour cette patiente
    const dossierActif = await this.dossiersRepo.findOne({
      where: { patienteId: patiente.id, statut: 'OUVERT' },
    });
    if (dossierActif) {
      throw new ConflictException({
        message: 'Cette patiente possède déjà un dossier CPN ouvert.',
        dossierId: dossierActif.id,
      });
    }

    const numeroDossierCpn = await this.genererNumeroDossierCpn();

    const dossier = this.dossiersRepo.create({
      patienteId: patiente.id,
      numeroDossierCpn,
      dateOuverture: dto.dateOuverture,
      statut: 'OUVERT',
      gestite: dto.gestite ?? 0,
      parite: dto.parite ?? 0,
      nombreAvortements: dto.nombreAvortements ?? 0,
      derniersRegles: dto.derniersRegles ?? null,
      dateProbableAccouchement: dto.dateProbableAccouchement ?? null,
      ageGestionnelOuverture: dto.ageGestionnelOuverture ?? null,
      antecedentsMedicaux: dto.antecedentsMedicaux ?? null,
      antecedentsChirurgicaux: dto.antecedentsChirurgicaux ?? null,
      antecedentsGynecologiques: dto.antecedentsGynecologiques ?? null,
      antecedentsObstetricaux: dto.antecedentsObstetricaux ?? null,
      allergies: dto.allergies ?? null,
      groupeSanguin: dto.groupeSanguin ?? null,
      rhesus: dto.rhesus ?? null,
      vihStatut: dto.vihStatut ?? 'INCONNU',
      notes: dto.notes ?? null,
      facteursRisque: dto.facteursRisque ? JSON.stringify(dto.facteursRisque) : null,
      taille: dto.taille ?? null,
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.dossiersRepo.save(dossier);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'CREATION',
      module: 'CPN',
      section: 'Dossier',
      ressourceId: enregistre.id,
      description: `Ouverture du dossier CPN ${enregistre.numeroDossierCpn}`,
    });

    return {
      message: 'Dossier CPN ouvert avec succes.',
      dossier: this.formaterDossierResume({ ...enregistre, patiente }),
    };
  }

  async modifierDossier(id: string, dto: ModifierDossierCpnDto) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['patiente'],
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${id} introuvable.`);
    }

    // Un dossier CPN ne peut être clos que par un accouchement, pas manuellement
    if (dto.statut === 'CLOS' && dossier.statut !== 'CLOS') {
      throw new BadRequestException(
        'Un dossier CPN ne peut être clôturé que par l\'enregistrement d\'un accouchement. La clôture manuelle est interdite.',
      );
    }

    // Bloquer la réouverture d'un dossier CPN déjà lié à un accouchement
    if (dto.statut === 'OUVERT' && dossier.statut === 'CLOS') {
      const accLie = await this.accouchementsRepo.findOne({ where: { dossierCpnId: id } });
      if (accLie) {
        throw new ConflictException(
          `Ce dossier CPN est lié à l'accouchement ${accLie.numeroAccouchement ?? accLie.id} et ne peut pas être rouvert.`,
        );
      }
    }

    Object.assign(dossier, {
      statut: dto.statut ?? dossier.statut,
      gestite: dto.gestite ?? dossier.gestite,
      parite: dto.parite ?? dossier.parite,
      nombreAvortements: dto.nombreAvortements ?? dossier.nombreAvortements,
      derniersRegles: typeof dto.derniersRegles !== 'undefined' ? dto.derniersRegles : dossier.derniersRegles,
      dateProbableAccouchement:
        typeof dto.dateProbableAccouchement !== 'undefined'
          ? dto.dateProbableAccouchement
          : dossier.dateProbableAccouchement,
      ageGestionnelOuverture:
        typeof dto.ageGestionnelOuverture !== 'undefined'
          ? dto.ageGestionnelOuverture
          : dossier.ageGestionnelOuverture,
      antecedentsMedicaux:
        typeof dto.antecedentsMedicaux !== 'undefined' ? dto.antecedentsMedicaux : dossier.antecedentsMedicaux,
      antecedentsChirurgicaux:
        typeof dto.antecedentsChirurgicaux !== 'undefined'
          ? dto.antecedentsChirurgicaux
          : dossier.antecedentsChirurgicaux,
      antecedentsGynecologiques:
        typeof dto.antecedentsGynecologiques !== 'undefined'
          ? dto.antecedentsGynecologiques
          : dossier.antecedentsGynecologiques,
      antecedentsObstetricaux:
        typeof dto.antecedentsObstetricaux !== 'undefined'
          ? dto.antecedentsObstetricaux
          : dossier.antecedentsObstetricaux,
      allergies: typeof dto.allergies !== 'undefined' ? dto.allergies : dossier.allergies,
      groupeSanguin: typeof dto.groupeSanguin !== 'undefined' ? dto.groupeSanguin : dossier.groupeSanguin,
      rhesus: typeof dto.rhesus !== 'undefined' ? dto.rhesus : dossier.rhesus,
      vihStatut: dto.vihStatut ?? dossier.vihStatut,
      notes: typeof dto.notes !== 'undefined' ? dto.notes : dossier.notes,
      facteursRisque:
        typeof dto.facteursRisque !== 'undefined'
          ? (dto.facteursRisque ? JSON.stringify(dto.facteursRisque) : null)
          : dossier.facteursRisque,
      taille: typeof dto.taille !== 'undefined' ? dto.taille : dossier.taille,
      // Champs de clôture
      notesCloture: typeof dto.notesCloture !== 'undefined' ? dto.notesCloture : dossier.notesCloture,
      closPar: typeof dto.closPar !== 'undefined' ? dto.closPar : dossier.closPar,
      dateCloture:
        dto.statut === 'CLOS' && dossier.statut !== 'CLOS'
          ? new Date().toISOString().split('T')[0]
          : dto.statut === 'OUVERT'
            ? null
            : dossier.dateCloture,
      modifiePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.dossiersRepo.save(dossier);

    void this.journalService.enregistrer({
      utilisateurId: dto.utilisateurId,
      utilisateurNom: dto.utilisateurNom,
      typeAction: 'MODIFICATION',
      module: 'CPN',
      section: 'Dossier',
      ressourceId: enregistre.id,
      description: `Modification du dossier CPN ${enregistre.numeroDossierCpn ?? dossier.numeroDossierCpn ?? 'N° indisponible'}`,
      meta: {
        numeroDossierCpn: enregistre.numeroDossierCpn ?? dossier.numeroDossierCpn ?? null,
      },
    });

    return {
      message: 'Dossier CPN mis a jour.',
      dossier: this.formaterDossierResume(enregistre),
    };
  }

  async supprimerDossier(id: string) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id },
      relations: ['contacts'],
    });
    if (!dossier) throw new NotFoundException(`Dossier CPN #${id} introuvable.`);

    const accLie = await this.accouchementsRepo.findOne({ where: { dossierCpnId: id } });
    if (accLie) {
      throw new BadRequestException('Ce dossier CPN est lié à un accouchement et ne peut pas être supprimé.');
    }

    const nbContacts = await this.contactsRepo.count({ where: { dossierCpnId: id } });
    if (nbContacts > 0) {
      throw new BadRequestException('Ce dossier CPN contient des contacts et ne peut pas être supprimé.');
    }

    await this.dossiersRepo.remove(dossier);
    return { message: 'Dossier CPN supprimé avec succès.' };
  }

  // --- Contacts CPN ---

  async ajouterContact(dossierId: string, dto: CreerContactCpnDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${dossierId} introuvable.`);
    }

    // Vérifier si un contact existe déjà pour cette date
    const contactExistant = await this.contactsRepo.findOne({
      where: { dossierCpnId: dossierId, dateContact: dto.dateContact },
    });

    if (contactExistant) {
      throw new ConflictException({
        message: `Un contact CPN existe deja pour le ${dto.dateContact}.`,
        code: 'CONTACT_DOUBLON_DATE',
        contactId: contactExistant.id,
      });
    }

    const nombreExistants = await this.contactsRepo.count({
      where: { dossierCpnId: dossierId },
    });

    const contact = this.contactsRepo.create({
      dossierCpnId: dossierId,
      numeroContact: nombreExistants + 1,
      dateContact: dto.dateContact,
      ageGestationnel: dto.ageGestationnel ?? null,
      poids: dto.poids ?? null,
      tensionSystolique: dto.tensionSystolique ?? null,
      tensionDiastolique: dto.tensionDiastolique ?? null,
      temperature: dto.temperature ?? null,
      hauteurUterine: dto.hauteurUterine ?? null,
      frequenceCardiaqueMore: dto.frequenceCardiaqueMore ?? null,
      bfc: dto.bfc ?? null,
      presentationFoetale: dto.presentationFoetale ?? null,
      mouvementsActifs: dto.mouvementsActifs ?? null,
      oedemes: dto.oedemes ?? null,
      varices: dto.varices ?? null,
      etatGeneral: dto.etatGeneral ?? null,
      perimetreBrachial: dto.perimetreBrachial ?? null,
      proteInurie: dto.proteInurie ?? null,
      paleur: dto.paleur ?? null,
      ecoulementVaginal: dto.ecoulementVaginal ?? null,
      ulcerationsGenitales: dto.ulcerationsGenitales ?? null,
      etatDuCol: dto.etatDuCol ?? null,
      observations: dto.observations ?? null,
      traitementPrescrit: dto.traitementPrescrit ?? null,
      prochainRdvDate: dto.prochainRdvDate ?? null,
      prochainRdvNotes: dto.prochainRdvNotes ?? null,
      enregistrePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.contactsRepo.save(contact);

    // Journal
    if (dto.utilisateurId && dto.utilisateurNom) {
      void this.journalService.enregistrer({
        utilisateurId: dto.utilisateurId,
        utilisateurNom: dto.utilisateurNom,
        typeAction: 'CREATION',
        module: 'CPN',
        section: 'CONTACT',
        ressourceId: enregistre.id,
        description: `Création du contact CPN n°${enregistre.numeroContact} pour le dossier ${dossier.numeroDossierCpn ?? 'N° indisponible'}`,
        meta: {
          dossierId,
          numeroDossierCpn: dossier.numeroDossierCpn ?? null,
          contactId: enregistre.id,
          numeroContact: enregistre.numeroContact,
        },
      });
    }

    // Créer automatiquement un rendez-vous EN_ATTENTE si une date de prochain RDV est définie
    if (dto.prochainRdvDate) {
      try {
        const existant = await this.rdvRepo.findOne({
          where: { refDossier: dossier.numeroDossierCpn, dateRdv: dto.prochainRdvDate, statut: Not(In(['ANNULE', 'TERMINE'])) },
        });
        if (!existant) {
          const patiente = dossier.patienteId
            ? await this.patientesRepo.findOne({ where: { id: dossier.patienteId } })
            : null;
          const nom = patiente
            ? [patiente.nom, patiente.postnom, patiente.prenom].filter(Boolean).join(' ')
            : dossier.numeroDossierCpn;
          const initiales = nom.trim().split(/\s+/).slice(0, 2).map((m: string) => m.charAt(0).toUpperCase()).join('') || '?';
          await this.rdvRepo.save(this.rdvRepo.create({
            dateRdv: dto.prochainRdvDate,
            heureRdv: '08:00',
            motif: 'Contact CPN',
            statut: 'EN_ATTENTE',
            typeRdv: 'PROGRAMME',
            nomPatient: nom,
            initialesPatient: initiales,
            typePatient: 'Mere',
            refDossier: dossier.numeroDossierCpn,
            serviceDestination: 'Maternite (CPN)',
            creePar: dto.utilisateurNom ?? null,
            enregistrePar: dto.utilisateurNom ?? null,
          }));
        }
      } catch { /* Silencieux : ne pas bloquer le contact si le RDV échoue */ }
    }

    return {
      message: `Contact CPN ${enregistre.numeroContact} enregistre avec succes.`,
      contact: this.formaterContact(enregistre),
    };
  }

  async obtenirContact(dossierId: string, contactId: string) {
    const contact = await this.contactsRepo.findOne({
      where: { id: contactId, dossierCpnId: dossierId },
      relations: ['examens'],
    });

    if (!contact) {
      throw new NotFoundException(`Contact CPN #${contactId} introuvable.`);
    }

    return { contact: this.formaterContact(contact) };
  }

  async modifierContact(dossierId: string, contactId: string, dto: ModifierContactCpnDto) {
    const contact = await this.contactsRepo.findOne({
      where: { id: contactId, dossierCpnId: dossierId },
    });

    if (!contact) {
      throw new NotFoundException(`Contact CPN #${contactId} introuvable.`);
    }

    const ancienProchainRdvDate = contact.prochainRdvDate ?? null;

    Object.assign(contact, {
      dateContact: dto.dateContact ?? contact.dateContact,
      ageGestationnel: typeof dto.ageGestationnel !== 'undefined' ? dto.ageGestationnel : contact.ageGestationnel,
      poids: typeof dto.poids !== 'undefined' ? dto.poids : contact.poids,
      tensionSystolique:
        typeof dto.tensionSystolique !== 'undefined' ? dto.tensionSystolique : contact.tensionSystolique,
      tensionDiastolique:
        typeof dto.tensionDiastolique !== 'undefined' ? dto.tensionDiastolique : contact.tensionDiastolique,
      temperature: typeof dto.temperature !== 'undefined' ? dto.temperature : contact.temperature,
      hauteurUterine: typeof dto.hauteurUterine !== 'undefined' ? dto.hauteurUterine : contact.hauteurUterine,
      frequenceCardiaqueMore:
        typeof dto.frequenceCardiaqueMore !== 'undefined'
          ? dto.frequenceCardiaqueMore
          : contact.frequenceCardiaqueMore,
      bfc: typeof dto.bfc !== 'undefined' ? dto.bfc : contact.bfc,
      presentationFoetale:
        typeof dto.presentationFoetale !== 'undefined' ? dto.presentationFoetale : contact.presentationFoetale,
      mouvementsActifs:
        typeof dto.mouvementsActifs !== 'undefined' ? dto.mouvementsActifs : contact.mouvementsActifs,
      oedemes: typeof dto.oedemes !== 'undefined' ? dto.oedemes : contact.oedemes,
      varices: typeof dto.varices !== 'undefined' ? dto.varices : contact.varices,
      etatGeneral: typeof dto.etatGeneral !== 'undefined' ? dto.etatGeneral : contact.etatGeneral,
      perimetreBrachial: typeof dto.perimetreBrachial !== 'undefined' ? dto.perimetreBrachial : contact.perimetreBrachial,
      proteInurie: typeof dto.proteInurie !== 'undefined' ? dto.proteInurie : contact.proteInurie,
      paleur: typeof dto.paleur !== 'undefined' ? dto.paleur : contact.paleur,
      ecoulementVaginal: typeof dto.ecoulementVaginal !== 'undefined' ? dto.ecoulementVaginal : contact.ecoulementVaginal,
      ulcerationsGenitales: typeof dto.ulcerationsGenitales !== 'undefined' ? dto.ulcerationsGenitales : contact.ulcerationsGenitales,
      etatDuCol: typeof dto.etatDuCol !== 'undefined' ? dto.etatDuCol : contact.etatDuCol,
      observations: typeof dto.observations !== 'undefined' ? dto.observations : contact.observations,
      traitementPrescrit:
        typeof dto.traitementPrescrit !== 'undefined' ? dto.traitementPrescrit : contact.traitementPrescrit,
      prochainRdvDate:
        typeof dto.prochainRdvDate !== 'undefined' ? dto.prochainRdvDate : contact.prochainRdvDate,
      prochainRdvNotes:
        typeof dto.prochainRdvNotes !== 'undefined' ? dto.prochainRdvNotes : contact.prochainRdvNotes,
      modifiePar: dto.utilisateurNom ?? null,
    });

    const enregistre = await this.contactsRepo.save(contact);

    const dossierJournal = await this.dossiersRepo.findOne({ where: { id: dossierId } });

    // Journal
    if (dto.utilisateurId && dto.utilisateurNom) {
      void this.journalService.enregistrer({
        utilisateurId: dto.utilisateurId,
        utilisateurNom: dto.utilisateurNom,
        typeAction: 'MODIFICATION',
        module: 'CPN',
        section: 'CONTACT',
        ressourceId: contactId,
        description: `Modification du contact CPN n°${enregistre.numeroContact} pour le dossier ${dossierJournal?.numeroDossierCpn ?? 'N° indisponible'}`,
        meta: {
          dossierId,
          numeroDossierCpn: dossierJournal?.numeroDossierCpn ?? null,
          contactId,
          numeroContact: enregistre.numeroContact,
        },
      });
    }

    // Synchroniser le rendez-vous avec la date réellement enregistrée sur le contact.
    if (enregistre.prochainRdvDate) {
      try {
        const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });
        if (dossier?.numeroDossierCpn) {
          const dateCible = enregistre.prochainRdvDate;

          const dejaSurNouvelleDate = await this.rdvRepo.findOne({
            where: {
              refDossier: dossier.numeroDossierCpn,
              dateRdv: dateCible,
              serviceDestination: 'Maternite (CPN)',
              motif: 'Contact CPN',
              statut: Not(In(['ANNULE', 'TERMINE'])),
            },
          });

          if (!dejaSurNouvelleDate && ancienProchainRdvDate && ancienProchainRdvDate !== dateCible) {
            const existantAncienneDate = await this.rdvRepo.findOne({
              where: {
                refDossier: dossier.numeroDossierCpn,
                dateRdv: ancienProchainRdvDate,
                serviceDestination: 'Maternite (CPN)',
                motif: 'Contact CPN',
                statut: Not(In(['ANNULE', 'TERMINE'])),
              },
            });

            if (existantAncienneDate) {
              existantAncienneDate.dateRdv = dateCible;
              existantAncienneDate.statut = 'REPROGRAMME';
              existantAncienneDate.modifiePar = dto.utilisateurNom ?? null;
              await this.rdvRepo.save(existantAncienneDate);
            }
          }

          if (!dejaSurNouvelleDate && (!ancienProchainRdvDate || ancienProchainRdvDate === dateCible)) {
            const rdvAReprogrammer = await this.rdvRepo.findOne({
              where: {
                refDossier: dossier.numeroDossierCpn,
                dateRdv: Not(dateCible),
                serviceDestination: 'Maternite (CPN)',
                motif: 'Contact CPN',
                statut: Not(In(['ANNULE', 'TERMINE'])),
              },
              order: { creeLe: 'DESC' },
            });

            if (rdvAReprogrammer) {
              rdvAReprogrammer.dateRdv = dateCible;
              rdvAReprogrammer.statut = 'REPROGRAMME';
              rdvAReprogrammer.modifiePar = dto.utilisateurNom ?? null;
              await this.rdvRepo.save(rdvAReprogrammer);
            }
          }

          const existant = await this.rdvRepo.findOne({
            where: {
              refDossier: dossier.numeroDossierCpn,
              dateRdv: dateCible,
              serviceDestination: 'Maternite (CPN)',
              motif: 'Contact CPN',
              statut: Not(In(['ANNULE', 'TERMINE'])),
            },
          });

          if (!existant) {
            const patiente = dossier.patienteId
              ? await this.patientesRepo.findOne({ where: { id: dossier.patienteId } })
              : null;
            const nom = patiente
              ? [patiente.nom, patiente.postnom, patiente.prenom].filter(Boolean).join(' ')
              : dossier.numeroDossierCpn;
            const initiales =
              nom
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((m: string) => m.charAt(0).toUpperCase())
                .join('') || '?';

            await this.rdvRepo.save(
              this.rdvRepo.create({
                dateRdv: dateCible,
                heureRdv: '08:00',
                motif: 'Contact CPN',
                statut: 'EN_ATTENTE',
                typeRdv: 'PROGRAMME',
                nomPatient: nom,
                initialesPatient: initiales,
                typePatient: 'Mere',
                refDossier: dossier.numeroDossierCpn,
                serviceDestination: 'Maternite (CPN)',
                creePar: dto.utilisateurNom ?? null,
                enregistrePar: dto.utilisateurNom ?? null,
              }),
            );
          }
        }
      } catch {
        // Silencieux : ne pas bloquer la modification du contact si le RDV échoue.
      }
    }

    return {
      message: 'Contact CPN mis a jour.',
      contact: this.formaterContact(enregistre),
    };
  }

  // --- Examens CPN ---

  async demanderExamen(dossierId: string, dto: CreerExamenCpnDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${dossierId} introuvable.`);
    }

    const examen = this.examensRepo.create({
      dossierCpnId: dossierId,
      contactCpnId: dto.contactCpnId ?? null,
      typeExamen: dto.typeExamen,
      libelle: dto.libelle.trim(),
      statut: 'DEMANDE',
      source: dto.source ?? 'INTERNE',
      dateExamen: dto.dateExamen ?? null,
      notes: dto.notes ?? null,
    });

    const enregistre = await this.examensRepo.save(examen);

    return {
      message: 'Examen demande avec succes.',
      examen: this.formaterExamen(enregistre),
    };
  }

  async enregistrerResultatExamen(dossierId: string, examenId: string, dto: ModifierExamenCpnDto) {
    const examen = await this.examensRepo.findOne({
      where: { id: examenId, dossierCpnId: dossierId },
    });

    if (!examen) {
      throw new NotFoundException(`Examen CPN #${examenId} introuvable.`);
    }

    Object.assign(examen, {
      statut: dto.statut ?? examen.statut,
      source: dto.source ?? examen.source,
      resultat: typeof dto.resultat !== 'undefined' ? dto.resultat : examen.resultat,
      dateResultat: typeof dto.dateResultat !== 'undefined' ? dto.dateResultat : examen.dateResultat,
      notes: typeof dto.notes !== 'undefined' ? dto.notes : examen.notes,
    });

    const enregistre = await this.examensRepo.save(examen);

    return {
      message: 'Resultat examen enregistre.',
      examen: this.formaterExamen(enregistre),
    };
  }

  // Saisie de l'interprétation d'une échographie (patiente revient avec images)
  async entrerInterpretationEchographie(dossierId: string, examenId: string, dto: { interpretation: string }) {
    const examen = await this.examensRepo.findOne({ where: { id: examenId, dossierCpnId: dossierId } });
    if (!examen) {
      throw new NotFoundException(`Examen #${examenId} introuvable.`);
    }
    if (examen.typeExamen !== 'ECHOGRAPHIE') {
      throw new BadRequestException("Cet examen n'est pas une échographie.");
    }

    // Chercher si un contact a été créé aujourd'hui pour ce dossier
    const today = new Date().toISOString().split('T')[0];
    const contactDuJour = await this.contactsRepo.findOne({
      where: { dossierCpnId: dossierId, dateContact: today },
    });

    if (!contactDuJour) {
      throw new ConflictException({
        code: 'PAS_CONTACT_AUJOURD_HUI',
        message: "Aucun contact CPN créé pour aujourd'hui. Créez d'abord un contact pour enregistrer l'interprétation.",
      });
    }

    examen.resultat = dto.interpretation.trim();
    examen.statut = 'RESULTAT_RECU';
    examen.dateResultat = today;
    examen.contactCpnId = contactDuJour.id;
    examen.envoyeLe = new Date();

    const enregistre = await this.examensRepo.save(examen);
    return { message: "Interprétation de l'échographie enregistrée.", examen: this.formaterExamen(enregistre) };
  }

  async listerExamens(dossierId: string) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${dossierId} introuvable.`);
    }

    const examens = await this.examensRepo.find({
      where: { dossierCpnId: dossierId },
      order: { creeLe: 'DESC' },
    });

    return { examens: examens.map((e) => this.formaterExamen(e)) };
  }

  // --- Formatage ---

  private formaterDossierResume(dossier: DossierCpnEntity) {
    const contacts = dossier.contacts ?? [];
    const dernierContact = contacts.sort((a, b) => b.numeroContact - a.numeroContact)[0] ?? null;
    return {
      id: dossier.id,
      numeroDossierCpn: dossier.numeroDossierCpn,
      dateOuverture: dossier.dateOuverture,
      statut: dossier.statut,
      patienteId: dossier.patienteId,
      nomPatiente: dossier.patiente
        ? `${dossier.patiente.nom} ${dossier.patiente.postnom}${dossier.patiente.prenom ? ' ' + dossier.patiente.prenom : ''}`
        : null,
      numeroDossierPatiente: dossier.patiente?.numeroDossier ?? null,
      telephonePatiente: dossier.patiente?.telephone ?? null,
      dateNaissancePatiente: dossier.patiente?.dateNaissance ?? null,
      ageGestionnelOuverture: dossier.ageGestionnelOuverture,
      dernierAgeGestationnel: dernierContact?.ageGestationnel ?? null,
      prochainRdvDate: dernierContact?.prochainRdvDate ?? null,
      nombreContacts: contacts.length,
      derniersRegles: dossier.derniersRegles,
      dateProbableAccouchement: dossier.dateProbableAccouchement,
      gestite: dossier.gestite,
      parite: dossier.parite,
      groupeSanguin: dossier.groupeSanguin,
      rhesus: dossier.rhesus,
      vihStatut: dossier.vihStatut,
      creeLe: dossier.creeLe,
      notesCloture: dossier.notesCloture,
      closPar: dossier.closPar,
      dateCloture: dossier.dateCloture,
    };
  }

  private formaterDossierComplet(dossier: DossierCpnEntity) {
    const p = dossier.patiente;
    return {
      ...this.formaterDossierResume(dossier),
      nombreAvortements: dossier.nombreAvortements,
      antecedentsMedicaux: dossier.antecedentsMedicaux,
      antecedentsChirurgicaux: dossier.antecedentsChirurgicaux,
      antecedentsGynecologiques: dossier.antecedentsGynecologiques,
      antecedentsObstetricaux: dossier.antecedentsObstetricaux,
      allergies: dossier.allergies,
      groupeSanguin: dossier.groupeSanguin,
      rhesus: dossier.rhesus,
      vihStatut: dossier.vihStatut,
      notes: dossier.notes,
      facteursRisque: dossier.facteursRisque ? JSON.parse(dossier.facteursRisque) : [],
      taille: dossier.taille,
      notesCloture: dossier.notesCloture,
      closPar: dossier.closPar,
      dateCloture: dossier.dateCloture,
      patiente: p
        ? {
            id: p.id,
            numeroDossier: p.numeroDossier,
            nom: p.nom,
            postnom: p.postnom,
            prenom: p.prenom,
            dateNaissance: p.dateNaissance,
            age: p.age,
            adresse: p.adresse,
            telephone: p.telephone,
            etatMatrimonial: p.etatMatrimonial,
            nomPartenaire: p.nomPartenaire,
            occupationFemme: p.occupationFemme,
            occupationHomme: p.occupationHomme,
            personneUrgence: p.personneUrgence,
            telephoneUrgence: p.telephoneUrgence,
            adresseUrgence: p.adresseUrgence,
            dateEnregistrement: p.dateEnregistrement,
          }
        : null,
      contacts: (dossier.contacts ?? []).map((c) => this.formaterContact(c)),
      examens: (dossier.examens ?? []).map((e) => this.formaterExamen(e)),
      misAJourLe: dossier.misAJourLe,
      enregistrePar: dossier.enregistrePar,
      modifiePar: dossier.modifiePar,
    };
  }

  private formaterContact(contact: ContactCpnEntity) {
    return {
      id: contact.id,
      dossierCpnId: contact.dossierCpnId,
      numeroContact: contact.numeroContact,
      dateContact: contact.dateContact,
      ageGestationnel: contact.ageGestationnel,
      poids: contact.poids,
      tensionSystolique: contact.tensionSystolique,
      tensionDiastolique: contact.tensionDiastolique,
      temperature: contact.temperature,
      hauteurUterine: contact.hauteurUterine,
      frequenceCardiaqueMore: contact.frequenceCardiaqueMore,
      bfc: contact.bfc,
      presentationFoetale: contact.presentationFoetale,
      mouvementsActifs: contact.mouvementsActifs,
      oedemes: contact.oedemes,
      varices: contact.varices,
      etatGeneral: contact.etatGeneral,
      perimetreBrachial: contact.perimetreBrachial,
      proteInurie: contact.proteInurie,
      paleur: contact.paleur,
      ecoulementVaginal: contact.ecoulementVaginal,
      ulcerationsGenitales: contact.ulcerationsGenitales,
      etatDuCol: contact.etatDuCol,
      observations: contact.observations,
      traitementPrescrit: contact.traitementPrescrit,
      prochainRdvDate: contact.prochainRdvDate,
      prochainRdvNotes: contact.prochainRdvNotes,
      examens: (contact.examens ?? []).map((e) => this.formaterExamen(e)),
      creeLe: contact.creeLe,
      enregistrePar: contact.enregistrePar,
      modifiePar: contact.modifiePar,
    };
  }

  private formaterExamen(examen: ExamenCpnEntity) {
    return {
      id: examen.id,
      dossierCpnId: examen.dossierCpnId,
      contactCpnId: examen.contactCpnId,
      typeExamen: examen.typeExamen,
      libelle: examen.libelle,
      statut: examen.statut,
      source: examen.source,
      resultat: examen.resultat,
      dateExamen: examen.dateExamen,
      dateResultat: examen.dateResultat,
      notes: examen.notes,
      creeLe: examen.creeLe,
    };
  }

  // --- Analyse clinique assistée (GPT-4o) ---

  async analyserContact(dossierId: string, dto: AnalyserContactCpnDto) {
    const dossier = await this.dossiersRepo.findOne({
      where: { id: dossierId },
      relations: ['patiente', 'contacts'],
    });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${dossierId} introuvable.`);
    }

    const contacts = (dossier.contacts ?? []).sort((a, b) => a.numeroContact - b.numeroContact);

    // Tableau comparatif : tous les contacts passés + contact actuel
    const tableau = [
      ...contacts.map((c) => ({
        contact: c.numeroContact,
        date: c.dateContact,
        poids: c.poids != null ? `${c.poids} kg` : '—',
        tension: c.tensionSystolique != null ? `${c.tensionSystolique}/${c.tensionDiastolique}` : '—',
        bfc: c.bfc != null ? `${c.bfc} bpm` : '—',
        hu: c.hauteurUterine != null ? `${c.hauteurUterine} cm` : '—',
        proteInurie: c.proteInurie ?? '—',
        ag: c.ageGestationnel != null ? `${c.ageGestationnel} SA` : '—',
        estActuel: false,
      })),
      {
        contact: contacts.length + 1,
        date: new Date().toISOString().slice(0, 10),
        poids: dto.poids != null ? `${dto.poids} kg` : '—',
        tension: dto.tensionSystolique != null ? `${dto.tensionSystolique}/${dto.tensionDiastolique}` : '—',
        bfc: dto.bfc != null ? `${dto.bfc} bpm` : '—',
        hu: dto.hauteurUterine != null ? `${dto.hauteurUterine} cm` : '—',
        proteInurie: dto.proteInurie ?? '—',
        ag: dto.ageGestationnel != null ? `${dto.ageGestationnel} SA` : '—',
        estActuel: true,
      },
    ];

    // Contexte patiente pour le prompt
    const patiente = dossier.patiente;
    const age = patiente?.age ?? null;
    const ageLibelle = age != null ? `${age} ans` : (patiente?.dateNaissance ? `née le ${patiente.dateNaissance}` : 'inconnu');
    const contextePatiente = [
      `- Âge : ${ageLibelle}${age != null && age < 18 ? ' ⚠️ GROSSESSE ADOLESCENTE' : age != null && age > 35 ? ' ⚠️ ÂGE AVANCÉ' : ''}`,
      dossier.gestite != null ? `- Gestité : ${dossier.gestite}` : '',
      dossier.parite != null ? `- Parité : ${dossier.parite}` : '',
      dossier.nombreAvortements ? `- Avortements : ${dossier.nombreAvortements}` : '',
      dossier.rhesus ? `- Rhésus : ${dossier.rhesus}` : '',
      dossier.groupeSanguin ? `- Groupe sanguin : ${dossier.groupeSanguin}` : '',
      dossier.vihStatut ? `- VIH : ${dossier.vihStatut}` : '',
      dossier.antecedentsMedicaux ? `- Antécédents médicaux : ${dossier.antecedentsMedicaux}` : '',
      dossier.antecedentsObstetricaux ? `- Antécédents obstétricaux : ${dossier.antecedentsObstetricaux}` : '',
      dossier.facteursRisque ? `- Facteurs de risque : ${dossier.facteursRisque}` : '',
    ].filter(Boolean).join('\n');

    // Valeurs du contact actuel
    const valeurActuelles = [
      dto.ageGestationnel != null ? `- Âge gestationnel : ${dto.ageGestationnel} SA` : '',
      dto.poids != null ? `- Poids : ${dto.poids} kg` : '',
      dto.tensionSystolique != null ? `- Tension : ${dto.tensionSystolique}/${dto.tensionDiastolique} mmHg` : '',
      dto.temperature != null ? `- Température : ${dto.temperature} °C` : '',
      dto.bfc != null ? `- BCF (rythme cardiaque fœtal) : ${dto.bfc} bpm` : '',
      dto.hauteurUterine != null ? `- Hauteur utérine : ${dto.hauteurUterine} cm` : '',
      dto.mouvementsActifs != null ? `- Mouvements fœtaux : ${dto.mouvementsActifs ? 'présents' : 'absents'}` : '',
      dto.proteInurie != null ? `- Protéinurie : ${dto.proteInurie}` : '',
      dto.paleur != null ? `- Pâleur : ${dto.paleur ? 'oui' : 'non'}` : '',
      dto.oedemes != null ? `- Odèmes : ${dto.oedemes ? 'oui' : 'non'}` : '',
      dto.perimetreBrachial != null ? `- Périmètre brachial : ${dto.perimetreBrachial} cm` : '',
      dto.etatGeneral != null ? `- État général : ${dto.etatGeneral}` : '',
      dto.ecoulementVaginal ? `- Écoulement vaginal : oui` : '',
      dto.ulcerationsGenitales ? `- Ulcérations génitales : oui` : '',
    ].filter(Boolean).join('\n');

    // Historique contacts passés
    const historiqueTexte = contacts.length === 0
      ? 'Aucun contact antérieur.'
      : contacts.map((c) =>
          `CPN${c.numeroContact} (${c.dateContact}) : poids=${c.poids ?? '?'} kg, tension=${c.tensionSystolique ?? '?'}/${c.tensionDiastolique ?? '?'}, BCF=${c.bfc ?? '?'} bpm, HU=${c.hauteurUterine ?? '?'} cm, protéinurie=${c.proteInurie ?? '?'}`,
        ).join('\n');

    const prompt = `Tu es un assistant clinique dans une maternité à Goma, en RDC.
Tu aides les infirmières de consultation prénatale (CPN) à repérer les signes de danger.

Règles ABSOLUES :
- Tu n'es pas le médecin. Tu aides l'infirmière à décider.
- Ne jamais dire "référer à l'hôpital" : la patiente EST déjà à la maternité.
- Utilise du français simple, comme si tu parlais à une infirmière de terrain. Pas de jargon médical complexe.
- Ex : "la tension est trop haute" au lieu de "HTA", "le coeur du bébé bat trop lentement" au lieu de "bradycardie fœtale".
- L'âge de la patiente EST un critère d'analyse : si elle a moins de 18 ans ou plus de 35 ans, tu dois toujours créer un point d'analyse "age" et hausser la vigilance sur tous les autres signes.
- Une patiente de moins de 18 ans est une grossesse adolescente à haut risque : surveillance rapprochée obligatoire.
- Une patiente de plus de 35 ans a un risque accru de complications : sois plus prudent dans tes interprétations.

Contexte de la patiente :
${contextePatiente}

Historique des consultations précédentes :
${historiqueTexte}

Valeurs du contact actuel (CPN${contacts.length + 1}) :
${valeurActuelles}

Tu dois retourner un JSON VALIDE avec exactement cette structure :
{
  "niveau": "CRITIQUE" | "URGENT" | "ATTENTION" | "NORMAL",
  "conclusion": "un message court et direct pour l'infirmière (1-2 phrases)",
  "suggestionTraitement": "texte prêt à copier dans le champ traitement (2-5 lignes)",
  "pointsAnalyse": [
    {
      "code": "identifiant_court",
      "label": "Nom du point",
      "valeurActuelle": "valeur mesurée",
      "interpretation": "explication en français simple (1-2 phrases)",
      "statut": "OK" | "ATTENTION" | "URGENT" | "CRITIQUE"
    }
  ]
}

Niveaux :
- CRITIQUE : appeler le médecin de garde MAINTENANT, ne pas laisser partir la patiente
- URGENT : le médecin doit voir la patiente avant qu'elle rentre
- ATTENTION : rapprocher le prochain RDV à 2 semaines
- NORMAL : suivi normal, prochain RDV dans 4 semaines

Réponds UNIQUEMENT avec le JSON, sans texte avant ni après.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      temperature: 0.2,
      messages: [
        { role: 'system', content: 'Tu es un assistant clinique CPN. Tu réponds uniquement en JSON valide.' },
        { role: 'user', content: prompt },
      ],
    });

    const contenu = completion.choices[0]?.message?.content ?? '{}';
    const resultatIA = JSON.parse(contenu) as {
      niveau: string;
      conclusion: string;
      suggestionTraitement: string;
      pointsAnalyse: {
        code: string;
        label: string;
        valeurActuelle: string;
        interpretation: string;
        statut: string;
      }[];
    };

    return {
      niveau: resultatIA.niveau ?? 'NORMAL',
      conclusion: resultatIA.conclusion ?? '',
      suggestionTraitement: resultatIA.suggestionTraitement ?? '',
      pointsAnalyse: resultatIA.pointsAnalyse ?? [],
      tableau,
    };
  }

  private async genererNumeroDossierCpn(): Promise<string> {
    const annee = new Date().getFullYear();
    const compte = await this.dossiersRepo.count();
    const sequence = String(compte + 1).padStart(4, '0');
    return `CPN-${annee}-${sequence}`;
  }
}
