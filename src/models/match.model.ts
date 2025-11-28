export interface Match {
id: number;
bracketId?: number | null;
stageId?: number | null;
tournamentId: number;
round?: number;
matchIndex?: number;
teamAId?: number | null;
teamBId?: number | null;
scoreA?: number;
scoreB?: number;
status?: string;
scheduledAt?: string | null;
bestOf?: number;
metadata?: any;
createdAt: string;
updatedAt: string;
}