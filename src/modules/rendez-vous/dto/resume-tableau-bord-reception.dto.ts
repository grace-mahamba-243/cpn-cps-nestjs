// DTO representant le resume du jour fourni au tableau de bord de la reception.
export class ResumeTableauBordReceptionDto {
  // Nombre total de rendez-vous pour aujourd hui
  rdvDuJour: number;

  // Nombre de patients deja arrives (statut ARRIVE ou TERMINE)
  arrivees: number;

  // Liste compacte des rendez-vous du jour
  rdvPlanifies: LigneRdvDto[];
}

export class LigneRdvDto {
  id: string;
  nom: string;
  initiales: string;
  heure: string;
  motif: string;
  statut: string;
  typeRdv: string;
}
