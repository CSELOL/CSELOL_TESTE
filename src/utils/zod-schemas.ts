import { z } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { registry } from '../config/registry';

extendZodWithOpenApi(z);

export const CreateTournamentSchema = registry.register(
    'CreateTournament',
    z.object({
        tournament_name: z.string().min(3).openapi({ example: 'CBLOL 2024' }),
        tournament_description: z.string().optional().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
        banner_url: z.string().url().optional().nullable().openapi({ example: 'https://example.com/banner.png' }),
        logo_url: z.string().url().optional().nullable().openapi({ example: 'https://example.com/logo.png' }),
        format: z.enum(['single_elimination', 'double_elimination']).default('single_elimination').openapi({ example: 'single_elimination' }),
        has_lower_bracket: z.boolean().default(false).openapi({ example: false }),
        start_date: z.string().openapi({ example: '2024-01-20T00:00:00Z' }),
        is_listed: z.boolean().default(true).openapi({ example: true }),
        allow_signups: z.boolean().default(true).openapi({ example: true }),
        is_archived: z.boolean().default(false).openapi({ example: false }),
        status: z.enum(['draft', 'open', 'in_progress', 'completed']).default('draft').openapi({ example: 'draft' }),
    })
);

export const CreateTeamSchema = registry.register(
    'CreateTeam',
    z.object({
        name: z.string().min(2).openapi({ example: 'LOUD' }),
        tag: z.string().optional().openapi({ example: 'LLL' }),
        logoUrl: z.string().url().optional().openapi({ example: 'https://example.com/loud.png' }),
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

export const TournamentSchema = registry.register(
    'Tournament',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        tournament_name: z.string().openapi({ example: 'CBLOL 2024' }),
        tournament_description: z.string().nullable().openapi({ example: 'Campeonato Brasileiro de League of Legends' }),
        banner_url: z.string().nullable().openapi({ example: 'https://example.com/banner.png' }),
        logo_url: z.string().nullable().openapi({ example: 'https://example.com/logo.png' }),
        format: z.enum(['single_elimination', 'double_elimination']).openapi({ example: 'single_elimination' }),
        has_lower_bracket: z.boolean().openapi({ example: false }),
        start_date: z.string().openapi({ example: '2024-01-20T00:00:00Z' }),
        is_listed: z.boolean().openapi({ example: true }),
        allow_signups: z.boolean().openapi({ example: true }),
        is_archived: z.boolean().openapi({ example: false }),
        status: z.enum(['draft', 'open', 'in_progress', 'completed']).openapi({ example: 'draft' }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const TeamSchema = registry.register(
    'Team',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        name: z.string().openapi({ example: 'LOUD' }),
        tag: z.string().nullable().openapi({ example: 'LLL' }),
        logo_url: z.string().nullable().openapi({ example: 'https://example.com/loud.png' }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);

export const MatchSchema = registry.register(
    'Match',
    z.object({
        id: z.number().int().openapi({ example: 1 }),
        tournament_id: z.number().int().openapi({ example: 1 }),
        bracket_id: z.number().int().nullable().openapi({ example: 1 }),
        stage_id: z.number().int().nullable().openapi({ example: 1 }),
        team_a_id: z.number().int().openapi({ example: 1 }),
        team_b_id: z.number().int().openapi({ example: 2 }),
        scheduled_at: z.string().nullable().openapi({ example: '2024-01-20T13:00:00Z' }),
        best_of: z.number().int().nullable().openapi({ example: 1 }),
        status: z.string().openapi({ example: 'scheduled' }),
        created_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
        updated_at: z.string().openapi({ example: '2024-01-01T00:00:00Z' }),
    })
);