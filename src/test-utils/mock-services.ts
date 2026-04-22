/**
 * Mocks des services transversaux partagés entre plusieurs modules.
 * À importer dans n'importe quel fichier .spec.ts.
 */

// ─────────────────────────────────────────────────────────────
// JournalService — utilisé dans presque tous les services métier
// ─────────────────────────────────────────────────────────────
export const mockJournalService = {
  enregistrer: jest.fn().mockResolvedValue(undefined),
  lister: jest.fn().mockResolvedValue({ total: 0, page: 1, entrees: [] }),
};

// ─────────────────────────────────────────────────────────────
// OpenAI — utilisé dans CpnService et CpsFemmeService
// À UTILISER VIA jest.mock('openai', ...) dans le fichier spec,
// ce mock est fourni ici comme référence du comportement attendu.
// ─────────────────────────────────────────────────────────────
export const analyseIaMock = {
  observations: 'Constantes cliniques dans les normes.',
  alertes: [],
  recommandations: ['Continuer le suivi habituel.'],
};

// Réponse simulée de l'API OpenAI Chat Completions
export const openAiResponseMock = {
  choices: [
    {
      message: {
        content: JSON.stringify(analyseIaMock),
      },
    },
  ],
};

/**
 * Configuration jest.mock à placer en TÊTE de fichier spec
 * (avant tout import) pour tout service utilisant OpenAI.
 *
 * Usage dans cpn.service.spec.ts ou cps-femme.service.spec.ts :
 *
 * jest.mock('openai', () => ({
 *   __esModule: true,
 *   default: jest.fn().mockImplementation(() => ({
 *     chat: { completions: { create: jest.fn().mockResolvedValue(openAiResponseMock) } },
 *   })),
 * }));
 */

// ─────────────────────────────────────────────────────────────
// UsersService — si injecté en dépendance dans d'autres modules
// ─────────────────────────────────────────────────────────────
export const mockUsersService = {
  trouverParId: jest.fn(),
  trouverParIdentifiant: jest.fn(),
  listerUtilisateurs: jest.fn().mockResolvedValue({ utilisateurs: [], total: 0 }),
};

// ─────────────────────────────────────────────────────────────
// RolesService
// ─────────────────────────────────────────────────────────────
export const mockRolesService = {
  lister: jest.fn().mockResolvedValue([]),
  trouverParCode: jest.fn(),
};
