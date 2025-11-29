"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMatchSchema = exports.CreateTeamSchema = exports.CreateTournamentSchema = void 0;
const zod_1 = require("zod");
exports.CreateTournamentSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    slug: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    startDate: zod_1.z.string().optional(),
    endDate: zod_1.z.string().optional(),
    maxTeams: zod_1.z.number().int().optional(),
});
exports.CreateTeamSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    tag: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().url().optional(),
});
exports.CreateMatchSchema = zod_1.z.object({
    tournamentId: zod_1.z.number().int(),
    bracketId: zod_1.z.number().int().optional().nullable(),
    stageId: zod_1.z.number().int().optional().nullable(),
    teamAId: zod_1.z.number().int(),
    teamBId: zod_1.z.number().int(),
    scheduledAt: zod_1.z.string().optional(),
    bestOf: zod_1.z.number().int().optional(),
});
//# sourceMappingURL=zod-schemas.js.map