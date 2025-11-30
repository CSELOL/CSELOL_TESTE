"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerSchema = exports.TeamSchema = exports.TournamentSchema = exports.CreateMatchSchema = exports.CreatePlayerSchema = exports.CreateTeamSchema = exports.CreateTournamentSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const registry_1 = require("../config/registry");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
exports.CreateTournamentSchema = registry_1.registry.register('CreateTournament', zod_1.z.object({
    tournament_name: zod_1.z.string().min(3).openapi({ example: 'CBLOL 2024' }),
    tournament_description: zod_1.z.string().optional().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
    banner_url: zod_1.z.string().url().optional().nullable().openapi({ example: 'https://example.com/banner.png' }),
    logo_url: zod_1.z.string().url().optional().nullable().openapi({ example: 'https://example.com/logo.png' }),
    format: zod_1.z.enum(['single_elimination', 'double_elimination']).default('single_elimination').openapi({ example: 'single_elimination' }),
    has_lower_bracket: zod_1.z.boolean().default(false).openapi({ example: false }),
    start_date: zod_1.z.string().openapi({ example: '2024-01-20T00:00:00Z' }),
    is_listed: zod_1.z.boolean().default(true).openapi({ example: true }),
    allow_signups: zod_1.z.boolean().default(true).openapi({ example: true }),
    is_archived: zod_1.z.boolean().default(false).openapi({ example: false }),
    status: zod_1.z.enum(['draft', 'open', 'in_progress', 'completed']).default('draft').openapi({ example: 'draft' }),
}));
exports.CreateTeamSchema = registry_1.registry.register('CreateTeam', zod_1.z.object({
    name: zod_1.z.string().min(2).openapi({ example: 'LOUD' }),
    tag: zod_1.z.string().min(2).max(5).openapi({ example: 'LLL' }),
    logo_url: zod_1.z.string().optional().nullable().openapi({ example: 'https://example.com/loud.png' }),
    description: zod_1.z.string().optional().nullable().openapi({ example: 'A professional esports organization.' }),
    social_media: zod_1.z.any().optional().nullable().openapi({
        example: {
            twitter: 'x.com/loudgg',
            instagram: 'instagram.com/loudgg'
        }
    })
}));
exports.CreatePlayerSchema = registry_1.registry.register('CreatePlayer', zod_1.z.object({
    username: zod_1.z.string().min(3).openapi({ example: 'Faker' }),
    summoner_name: zod_1.z.string().optional().openapi({ example: 'Hide on bush' }),
    role: zod_1.z.enum(['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']).optional().openapi({ example: 'MID' }),
}));
exports.CreateMatchSchema = registry_1.registry.register('CreateMatch', zod_1.z.object({
    tournamentId: zod_1.z.number().int().openapi({ example: 1 }),
    bracketId: zod_1.z.number().int().optional().nullable().openapi({ example: 1 }),
    stageId: zod_1.z.number().int().optional().nullable().openapi({ example: 1 }),
    teamAId: zod_1.z.number().int().openapi({ example: 1 }),
    teamBId: zod_1.z.number().int().openapi({ example: 2 }),
    scheduledAt: zod_1.z.string().optional().openapi({ example: '2024-01-20T13:00:00Z' }),
    bestOf: zod_1.z.number().int().optional().openapi({ example: 1 }),
}));
exports.TournamentSchema = registry_1.registry.register('Tournament', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    tournament_name: zod_1.z.string().openapi({ example: 'CBLOL 2024' }),
    tournament_description: zod_1.z.string().nullable().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
    banner_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/banner.png' }),
    logo_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/logo.png' }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
exports.TeamSchema = registry_1.registry.register('Team', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    name: zod_1.z.string().openapi({ example: 'LOUD' }),
    tag: zod_1.z.string().openapi({ example: 'LLL' }),
    logo_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/loud.png' }),
    description: zod_1.z.string().nullable().openapi({ example: 'A professional esports organization.' }),
    social_media: zod_1.z.any().nullable().openapi({
        example: {
            twitter: 'x.com/loudgg',
            instagram: 'instagram.com/loudgg'
        }
    }),
    created_by_user_id: zod_1.z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
    invite_code: zod_1.z.string().openapi({ example: 'SLY-1234' }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
exports.PlayerSchema = registry_1.registry.register('Player', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    keycloak_id: zod_1.z.string().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
    username: zod_1.z.string().openapi({ example: 'Faker' }),
    summoner_name: zod_1.z.string().nullable().openapi({ example: 'Hide on bush' }),
    role: zod_1.z.string().nullable().openapi({ example: 'MID' }),
    team_id: zod_1.z.number().int().nullable().openapi({ example: 1 }),
    avatar_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/avatar.png' }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
//# sourceMappingURL=zod-schemas.js.map