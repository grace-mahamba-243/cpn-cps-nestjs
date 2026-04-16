import { Controller, Get, Query } from '@nestjs/common';
import { JournalService } from './journal.service';

// Ce controleur expose les endpoints de lecture du journal d'activites (admin seulement).
@Controller('journal')
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get()
  lister(
    @Query('utilisateurId') utilisateurId?: string,
    @Query('module') module?: string,
    @Query('typeAction') typeAction?: string,
    @Query('dateDebut') dateDebut?: string,
    @Query('dateFin') dateFin?: string,
    @Query('limite') limite?: string,
    @Query('page') page?: string,
  ) {
    return this.journalService.lister({
      utilisateurId,
      module,
      typeAction,
      dateDebut,
      dateFin,
      limite: limite ? parseInt(limite, 10) : undefined,
      page: page ? parseInt(page, 10) : undefined,
    });
  }
}
