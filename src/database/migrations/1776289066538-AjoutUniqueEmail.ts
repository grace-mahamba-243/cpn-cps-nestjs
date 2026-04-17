import { MigrationInterface, QueryRunner } from 'typeorm';

// Migration vide : remplacee par 1776289102248-AjoutUniqueEmail.
export class AjoutUniqueEmail1776289066538 implements MigrationInterface {
  name = 'AjoutUniqueEmail1776289066538';

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
