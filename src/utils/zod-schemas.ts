import { z } from 'zod';


export const CreateTournamentSchema = z.object({
name: z.string().min(3),
slug: z.string().optional(),
description: z.string().optional(),
startDate: z.string().optional(),
endDate: z.string().optional(),
maxTeams: z.number().int().optional(),
});


export const CreateTeamSchema = z.object({
name: z.string().min(2),
tag: z.string().optional(),
logoUrl: z.string().url().optional(),
});


export const CreateMatchSchema = z.object({
tournamentId: z.number().int(),
bracketId: z.number().int().optional().nullable(),
stageId: z.number().int().optional().nullable(),
teamAId: z.number().int(),
teamBId: z.number().int(),
scheduledAt: z.string().optional(),
bestOf: z.number().int().optional(),
});