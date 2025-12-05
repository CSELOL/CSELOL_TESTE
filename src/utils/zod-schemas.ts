import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../config/registry';

extendZodWithOpenApi(z);

// --- DB ENUMS & SHARED ---

const TournamentStatusEnum = z.enum(['draft', 'open', 'in_progress', 'completed']);
const TournamentFormatEnum = z.enum(['single_elimination', 'double_elimination', 'round_robin']);

// --- INPUT SCHEMAS ---

export const CreateTournamentSchema = registry.register(
    'CreateTournament',
    z.object({
        tournament_name: z.string().min(3).openapi({ example: 'CBLOL 2024' }),
        tournament_description: z.string().optional().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
        banner_url: z.string().url().optional().nullable().openapi({ example: 'https://example.com/banner.png' }),
        logo_url: z.string().url().optional().nullable().openapi({ example: 'https://example.com/logo.png' }),
        format: TournamentFormatEnum.default('single_elimination').openapi({ example: 'single_elimination' }),
        has_lower_bracket: z.boolean().default(false).openapi({ example: false }),
        start_date: z.string().openapi({ example: '2024-01-20T00:00:00Z' }),
        is_listed: z.boolean().default(true).openapi({ example: true }),
        allow_signups: z.boolean().default(true).openapi({ example: true }),
        is_archived: z.boolean().default(false).openapi({ example: false }),
        status: TournamentStatusEnum.default('draft').openapi({ example: 'draft' }),
    })
);

export const CreateTeamSchema = registry.register(
    'CreateTeam',
    z.object({
        name: z.string().min(2).openapi({ example: 'LOUD' }),
        tag: z.string().min(2).max(5).openapi({ example: 'LLL' }),
        logo_url: z.string().optional().nullable().openapi({ example: 'https://example.com/loud.png' }),
        description: z.string().optional().nullable().openapi({ example: 'A professional esports organization.' }),
        social_media: z.any().optional().nullable().openapi({
            example: {
                twitter: 'x.com/loudgg',
                instagram: 'instagram.com/loudgg'
            }
        })
    })
);

export const CreatePlayerSchema = registry.register(
    'CreatePlayer',
    z.object({
        username: z.string().min(3).openapi({ example: 'Faker' }),
        summoner_name: z.string().optional().openapi({ example: 'Hide on bush' }),
        role: z.enum(['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT']).optional().openapi({ example: 'MID' }),
    })
);

export const CreateMatchSchema = registry.register(
    'CreateMatch',
    z.object({
        tournamentId: z.number().int().openapi({ example: 1 }),
        bracketId: z.number().int().optional().nullable().openapi({ example: 1 }),
        stageId: z.number().int().optional().nullable().openapi({ example: 1 }),
        teamAId: z.number().int().openapi({ example: 1 }),
        teamBId: z.number().int().openapi({ example: 2 }),
        scheduledAt: z.string().optional().openapi({ example: '2024-01-20T13:00:00Z' }),
        bestOf: z.number().int().optional().openapi({ example: 1 }),
    })
);

// --- DATABASE REFLECTION SCHEMAS ---

export const TournamentSchema = registry.register(
    'Tournament',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        slug: z.string().nullable().openapi({ example: 'cblol-2024' }),
        tournament_name: z.string().openapi({ example: 'CBLOL 2024' }),
        tournament_description: z.string().nullable().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
        organizer_id: z.number().int().nullable().openapi({ example: 101 }),
        start_date: z.string().nullable().openapi({ example: '2024-01-20T00:00:00Z' }),
        status: TournamentStatusEnum.openapi({ example: 'draft' }),
        banner_url: z.string().nullable().openapi({ example: 'https://example.com/banner.png' }),
        logo_url: z.string().nullable().openapi({ example: 'https://example.com/logo.png' }),
        format: TournamentFormatEnum.openapi({ example: 'single_elimination' }),
        has_lower_bracket: z.boolean().openapi({ example: false }),
        is_listed: z.boolean().openapi({ example: true }),
        allow_signups: z.boolean().openapi({ example: true }),
        is_archived: z.boolean().openapi({ example: false }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const TeamSchema = registry.register(
    'Team',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        name: z.string().openapi({ example: 'LOUD' }),
        tag: z.string().openapi({ example: 'LLL' }),
        logo_url: z.string().nullable().openapi({ example: 'https://example.com/loud.png' }),
        description: z.string().nullable().openapi({ example: 'A professional esports organization.' }),
        social_media: z.any().nullable().openapi({
            example: {
                twitter: 'x.com/loudgg',
                instagram: 'instagram.com/loudgg'
            }
        }),
        invite_code: z.string().nullable().openapi({ example: 'SLY-1234' }),
        captain_id: z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
        created_by_user_id: z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const MatchSchema = registry.register(
    'Match',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        tournament_id: z.number().int().nullable().openapi({ example: 1 }),
        stage_id: z.number().int().nullable().openapi({ example: 1 }),
        stage: z.string().nullable().openapi({ example: 'Group Stage' }),
        group_name: z.string().nullable().openapi({ example: 'Group A' }),
        round: z.number().int().default(0).openapi({ example: 1 }),
        match_index: z.number().int().default(0).openapi({ example: 0 }),
        team_a_id: z.number().int().nullable().openapi({ example: 10 }),
        team_b_id: z.number().int().nullable().openapi({ example: 11 }),
        score_a: z.number().int().default(0).openapi({ example: 2 }),
        score_b: z.number().int().default(0).openapi({ example: 1 }),
        winner_id: z.number().int().nullable().openapi({ example: 10 }),
        next_match_id: z.number().int().nullable().openapi({ example: 15 }),
        status: z.string().default('scheduled').openapi({ example: 'completed' }),
        best_of: z.number().int().default(3).openapi({ example: 3 }),
        metadata: z.any().nullable().openapi({ example: { vod_url: '...' } }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const RegistrationSchema = registry.register(
    'Registration',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        tournament_id: z.number().int().openapi({ example: 1 }),
        team_id: z.number().int().openapi({ example: 1 }),
        payment_proof_url: z.string().nullable().openapi({ example: 'https://...' }),
        status: z.string().openapi({ example: 'PENDING' }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const StandingSchema = registry.register(
    'Standing',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        tournament_id: z.number().int().openapi({ example: 1 }),
        group_name: z.string().nullable().openapi({ example: 'Group A' }),
        team_id: z.number().int().openapi({ example: 1 }),
        matches_played: z.number().int().default(0),
        wins: z.number().int().default(0),
        losses: z.number().int().default(0),
        draws: z.number().int().default(0),
        points: z.number().int().default(0),
        score_diff: z.number().int().default(0),
    })
);

export const UserSchema = registry.register(
    'User',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        supabase_id: z.string().nullable().openapi({ example: '5a321c34-d952-4978-8a92-9f4134852b15' }),
        email: z.string().email().nullable().openapi({ example: 'user@example.com' }),
        nickname: z.string().nullable().openapi({ example: 'Faker' }),
        avatar_url: z.string().nullable().openapi({ example: 'https://example.com/avatar.png' }),
        riot_id: z.string().nullable().openapi({ example: 'Hide on bush#KR1' }),
        primary_role: z.string().nullable().openapi({ example: 'MID' }),
        secondary_role: z.string().nullable().openapi({ example: 'TOP' }),
        team_id: z.number().int().nullable().openapi({ example: 1 }),
        team_role: z.string().nullable().openapi({ example: 'CAPTAIN' }),
        roster_status: z.string().nullable().openapi({ example: 'ACTIVE' }),
        phone_number: z.string().nullable().openapi({ example: '+5511999999999' }),
        is_onboarded: z.boolean().default(false).openapi({ example: true }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);