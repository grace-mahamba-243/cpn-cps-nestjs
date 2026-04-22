/**
 * Usine générique de mock pour les repositories TypeORM.
 * Couvre TOUTES les méthodes utilisées dans les services du projet.
 * Chaque appel à mockRepository() retourne un objet Jest indépendant.
 */

import { SelectQueryBuilder } from 'typeorm';

// Type partiel qui reflète les méthodes TypeORM réellement utilisées dans les services
export type MockRepository<T = any> = {
  findOne: jest.Mock;
  find: jest.Mock;
  findAndCount: jest.Mock;
  count: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
  merge: jest.Mock;
  createQueryBuilder: jest.Mock;
};

/**
 * Fabrique un mock complet d'un Repository TypeORM.
 * À utiliser dans tous les fichiers .spec.ts via getRepositoryToken().
 */
export const mockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  remove: jest.fn(),
  // merge() simule Object.assign — comportement identique à TypeORM
  merge: jest.fn((entite: T, modifications: Partial<T>) =>
    Object.assign(entite as object, modifications),
  ),
  // createQueryBuilder retourne un spy enchaînable (fluent interface)
  createQueryBuilder: jest.fn(() => creerQueryBuilderMock()),
});

/**
 * Mock d'un SelectQueryBuilder TypeORM entièrement chaînable.
 * Toutes les méthodes retournent `this` pour permettre le chaînage.
 * Les méthodes terminales (getMany, getOne, getManyAndCount) sont des jest.fn().
 */
export const creerQueryBuilderMock = (): Partial<SelectQueryBuilder<any>> => {
  const qb: any = {
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    leftJoin: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    having: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    setParameter: jest.fn().mockReturnThis(),
    // Méthodes terminales — à surcharger dans chaque test si nécessaire
    getMany: jest.fn().mockResolvedValue([]),
    getOne: jest.fn().mockResolvedValue(null),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
    getRawMany: jest.fn().mockResolvedValue([]),
    getRawOne: jest.fn().mockResolvedValue(null),
    getCount: jest.fn().mockResolvedValue(0),
    execute: jest.fn().mockResolvedValue({}),
  };
  return qb;
};
