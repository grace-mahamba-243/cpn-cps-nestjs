import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CpnController } from './cpn.controller';
import { CpnService } from './cpn.service';
import { DossierCpnEntity } from './entities/dossier-cpn.entity';
import { ContactCpnEntity } from './entities/contact-cpn.entity';
import { ExamenCpnEntity } from './entities/examen-cpn.entity';
import { PatienteEntity } from '../patientes/entities/patiente.entity';
import { AccouchementEntity } from '../accouchements/entities/accouchement.entity';
import { JournalModule } from '../journal/journal.module';

// Ce module regroupe les entites et la logique metier du suivi prenatal CPN.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      DossierCpnEntity,
      ContactCpnEntity,
      ExamenCpnEntity,
      PatienteEntity,
      AccouchementEntity,
    ]),
    JournalModule,
  ],
  controllers: [CpnController],
  providers: [CpnService],
})
export class CpnModule {}
