"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.StandingSchema = exports.RegistrationSchema = exports.MatchSchema = exports.TeamSchema = exports.TournamentSchema = exports.CreateMatchSchema = exports.CreatePlayerSchema = exports.CreateTeamSchema = exports.CreateTournamentSchema = void 0;
const zod_1 = require("zod");
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const registry_1 = require("../config/registry");
(0, zod_to_openapi_1.extendZodWithOpenApi)(zod_1.z);
// --- DB ENUMS & SHARED ---
const TournamentStatusEnum = zod_1.z.enum(['draft', 'open', 'in_progress', 'completed']);
const TournamentFormatEnum = zod_1.z.enum(['single_elimination', 'double_elimination', 'round_robin']);
// --- INPUT SCHEMAS ---
exports.CreateTournamentSchema = registry_1.registry.register('CreateTournament', zod_1.z.object({
    tournament_name: zod_1.z.string().min(3).openapi({ example: 'CBLOL 2024' }),
    tournament_description: zod_1.z.string().optional().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
    banner_url: zod_1.z.string().url().optional().nullable().openapi({ example: 'https://example.com/banner.png' }),
    logo_url: zod_1.z.string().url().optional().nullable().openapi({ example: 'https://example.com/logo.png' }),
    format: TournamentFormatEnum.default('single_elimination').openapi({ example: 'single_elimination' }),
    has_lower_bracket: zod_1.z.boolean().default(false).openapi({ example: false }),
    start_date: zod_1.z.string().openapi({ example: '2024-01-20T00:00:00Z' }),
    is_listed: zod_1.z.boolean().default(true).openapi({ example: true }),
    allow_signups: zod_1.z.boolean().default(true).openapi({ example: true }),
    is_archived: zod_1.z.boolean().default(false).openapi({ example: false }),
    status: TournamentStatusEnum.default('draft').openapi({ example: 'draft' }),
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
// --- DATABASE REFLECTION SCHEMAS ---
exports.TournamentSchema = registry_1.registry.register('Tournament', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    slug: zod_1.z.string().nullable().openapi({ example: 'cblol-2024' }),
    tournament_name: zod_1.z.string().openapi({ example: 'CBLOL 2024' }),
    tournament_description: zod_1.z.string().nullable().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
    organizer_id: zod_1.z.number().int().nullable().openapi({ example: 101 }),
    start_date: zod_1.z.string().nullable().openapi({ example: '2024-01-20T00:00:00Z' }),
    status: TournamentStatusEnum.openapi({ example: 'draft' }),
    banner_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/banner.png' }),
    logo_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/logo.png' }),
    format: TournamentFormatEnum.openapi({ example: 'single_elimination' }),
    has_lower_bracket: zod_1.z.boolean().openapi({ example: false }),
    is_listed: zod_1.z.boolean().openapi({ example: true }),
    allow_signups: zod_1.z.boolean().openapi({ example: true }),
    is_archived: zod_1.z.boolean().openapi({ example: false }),
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
    invite_code: zod_1.z.string().nullable().openapi({ example: 'SLY-1234' }),
    captain_id: zod_1.z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
    created_by_user_id: zod_1.z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
exports.MatchSchema = registry_1.registry.register('Match', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    tournament_id: zod_1.z.number().int().nullable().openapi({ example: 1 }),
    stage_id: zod_1.z.number().int().nullable().openapi({ example: 1 }),
    stage: zod_1.z.string().nullable().openapi({ example: 'Group Stage' }),
    group_name: zod_1.z.string().nullable().openapi({ example: 'Group A' }),
    round: zod_1.z.number().int().default(0).openapi({ example: 1 }),
    match_index: zod_1.z.number().int().default(0).openapi({ example: 0 }),
    team_a_id: zod_1.z.number().int().nullable().openapi({ example: 10 }),
    team_b_id: zod_1.z.number().int().nullable().openapi({ example: 11 }),
    score_a: zod_1.z.number().int().default(0).openapi({ example: 2 }),
    score_b: zod_1.z.number().int().default(0).openapi({ example: 1 }),
    winner_id: zod_1.z.number().int().nullable().openapi({ example: 10 }),
    next_match_id: zod_1.z.number().int().nullable().openapi({ example: 15 }),
    status: zod_1.z.string().default('scheduled').openapi({ example: 'completed' }),
    best_of: zod_1.z.number().int().default(3).openapi({ example: 3 }),
    metadata: zod_1.z.any().nullable().openapi({ example: { vod_url: '...' } }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
exports.RegistrationSchema = registry_1.registry.register('Registration', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    tournament_id: zod_1.z.number().int().openapi({ example: 1 }),
    team_id: zod_1.z.number().int().openapi({ example: 1 }),
    payment_proof_url: zod_1.z.string().nullable().openapi({ example: 'https://...' }),
    status: zod_1.z.string().openapi({ example: 'PENDING' }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
exports.StandingSchema = registry_1.registry.register('Standing', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    tournament_id: zod_1.z.number().int().openapi({ example: 1 }),
    group_name: zod_1.z.string().nullable().openapi({ example: 'Group A' }),
    team_id: zod_1.z.number().int().openapi({ example: 1 }),
    matches_played: zod_1.z.number().int().default(0),
    wins: zod_1.z.number().int().default(0),
    losses: zod_1.z.number().int().default(0),
    draws: zod_1.z.number().int().default(0),
    points: zod_1.z.number().int().default(0),
    score_diff: zod_1.z.number().int().default(0),
}));
exports.UserSchema = registry_1.registry.register('User', zod_1.z.object({
    id: zod_1.z.number().int().openapi({ example: 1 }),
    supabase_id: zod_1.z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
    email: zod_1.z.string().email().nullable().openapi({ example: 'user@example.com' }),
    nickname: zod_1.z.string().nullable().openapi({ example: 'Faker' }),
    avatar_url: zod_1.z.string().nullable().openapi({ example: 'https://example.com/avatar.png' }),
    riot_id: zod_1.z.string().nullable().openapi({ example: 'Hide on bush#KR1' }),
    primary_role: zod_1.z.string().nullable().openapi({ example: 'MID' }),
    secondary_role: zod_1.z.string().nullable().openapi({ example: 'TOP' }),
    team_id: zod_1.z.number().int().nullable().openapi({ example: 1 }),
    team_role: zod_1.z.string().nullable().openapi({ example: 'CAPTAIN' }),
    roster_status: zod_1.z.string().nullable().openapi({ example: 'ACTIVE' }),
    phone_number: zod_1.z.string().nullable().openapi({ example: '+5511999999999' }),
    is_onboarded: zod_1.z.boolean().default(false).openapi({ example: true }),
    created_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    updated_at: zod_1.z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
}));
//# sourceMappingURL=zod-schemas.js.map