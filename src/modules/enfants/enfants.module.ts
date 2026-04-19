import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnfantsController } from './enfants.controller';
import { EnfantsService } from './enfants.service';
import { EnfantEntity } from './entities/enfant.entity';
import { ExamenEnfantEntity } from './entities/examen-enfant.entity';

// Ce module configure le module enfants et enregistre l'entite pour l'injection.
@Module({
  imports: [TypeOrmModule.forFeature([EnfantEntity, ExamenEnfantEntity])],
  controllers: [EnfantsController],
  providers: [EnfantsService],
  exports: [EnfantsService],
})
export class EnfantsModule {}
