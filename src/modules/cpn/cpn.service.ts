import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { DossierCpnEntity } from './entities/dossier-cpn.entity';
import { ContactCpnEntity } from './entities/contact-cpn.entity';
import { ExamenCpnEntity } from './entities/examen-cpn.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { CreerDossierCpnDto } from './dto/creer-dossier-cpn.dto';
import { ModifierDossierCpnDto } from './dto/modifier-dossier-cpn.dto';
import { CreerContactCpnDto } from './dto/creer-contact-cpn.dto';
import { ModifierContactCpnDto } from './dto/modifier-contact-cpn.dto';
import { CreerExamenCpnDto } from './dto/creer-examen-cpn.dto';
import { ModifierExamenCpnDto } from './dto/modifier-examen-cpn.dto';

// Ce service centralise toute la logique metier du module CPN.
@Injectable()
export class CpnService {
  constructor(
    @InjectRepository(DossierCpnEntity)
    private readonly dossiersRepo: Repository<DossierCpnEntity>,
    @InjectRepository(ContactCpnEntity)
    private readonly contactsRepo: Repository<ContactCpnEntity>,
    @InjectRepository(ExamenCpnEntity)
    private readonly examensRepo: Repository<ExamenCpnEntity>,
    @InjectRepository(PatienteEntity)
    private readonly patientesRepo: Repository<PatienteEntity>,
  ) {}

  // --- Dossiers CPN ---

  async listerDossiers(recherche?: string) {
    let dossiers: DossierCpnEntity[];

    if (recherche && recherche.trim()) {
      const terme = recherche.trim();
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
        .where('d.patiente_id IN (:...ids)', { ids })
        .orderBy('d.cree_le', 'DESC')
        .getMany();
    } else {
      dossiers = await this.dossiersRepo.find({
        relations: ['patiente'],
        order: { creeLe: 'DESC' },
      });
    }

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
    const patiente = await this.patientesRepo.findOne({
      where: { id: dto.patienteId },
    });

    if (!patiente) {
      throw new NotFoundException('Patiente introuvable.');
    }

    const numeroDossierCpn = await this.genererNumeroDossierCpn();

    const dossier = this.dossiersRepo.create({
      patienteId: dto.patienteId,
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
    });

    const enregistre = await this.dossiersRepo.save(dossier);

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
    });

    const enregistre = await this.dossiersRepo.save(dossier);

    return {
      message: 'Dossier CPN mis a jour.',
      dossier: this.formaterDossierResume(enregistre),
    };
  }

  // --- Contacts CPN ---

  async ajouterContact(dossierId: string, dto: CreerContactCpnDto) {
    const dossier = await this.dossiersRepo.findOne({ where: { id: dossierId } });

    if (!dossier) {
      throw new NotFoundException(`Dossier CPN #${dossierId} introuvable.`);
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
      observations: dto.observations ?? null,
      traitementPrescrit: dto.traitementPrescrit ?? null,
      prochainRdvDate: dto.prochainRdvDate ?? null,
      prochainRdvNotes: dto.prochainRdvNotes ?? null,
    });

    const enregistre = await this.contactsRepo.save(contact);

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
      observations: typeof dto.observations !== 'undefined' ? dto.observations : contact.observations,
      traitementPrescrit:
        typeof dto.traitementPrescrit !== 'undefined' ? dto.traitementPrescrit : contact.traitementPrescrit,
      prochainRdvDate:
        typeof dto.prochainRdvDate !== 'undefined' ? dto.prochainRdvDate : contact.prochainRdvDate,
      prochainRdvNotes:
        typeof dto.prochainRdvNotes !== 'undefined' ? dto.prochainRdvNotes : contact.prochainRdvNotes,
    });

    const enregistre = await this.contactsRepo.save(contact);

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
      ageGestionnelOuverture: dossier.ageGestionnelOuverture,
      derniersRegles: dossier.derniersRegles,
      dateProbableAccouchement: dossier.dateProbableAccouchement,
      gestite: dossier.gestite,
      parite: dossier.parite,
      creeLe: dossier.creeLe,
    };
  }

  private formaterDossierComplet(dossier: DossierCpnEntity) {
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
      contacts: (dossier.contacts ?? []).map((c) => this.formaterContact(c)),
      examens: (dossier.examens ?? []).map((e) => this.formaterExamen(e)),
      misAJourLe: dossier.misAJourLe,
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
      observations: contact.observations,
      traitementPrescrit: contact.traitementPrescrit,
      prochainRdvDate: contact.prochainRdvDate,
      prochainRdvNotes: contact.prochainRdvNotes,
      examens: (contact.examens ?? []).map((e) => this.formaterExamen(e)),
      creeLe: contact.creeLe,
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

  private async genererNumeroDossierCpn(): Promise<string> {
    const annee = new Date().getFullYear();
    const compte = await this.dossiersRepo.count();
    const sequence = String(compte + 1).padStart(4, '0');
    return `CPN-${annee}-${sequence}`;
  }
}
