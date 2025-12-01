export interface Match {
    id: number;
    tournamentId: number;

    // Phase Configuration
    stage: 'groups' | 'playoffs';
    groupName?: string | null; // 'A', 'B' (Only for groups)
    round?: number;       // Matchday (Groups) or Round (Playoffs)
    matchIndex?: number;  // Position in the bracket/list

    // Teams (A = Blue Side, B = Red Side)
    teamAId?: number | null;
    teamBId?: number | null;

    // Results
    scoreA: number;
    scoreB: number;
    winnerId?: number | null;

    // Settings
    bestOf: number; // 1, 3, 5
    status: 'scheduled' | 'live' | 'completed';
    scheduledAt?: string | null;

    // Meta (Penalties, VOD links, etc)
    metadata?: {
        penaltyA?: number; // e.g. -1 game loss
        penaltyB?: number;
        manualOverride?: boolean;
    };

    // Join Fields (Convenience)
    teamAName?: string;
    teamATag?: string;
    teamALogo?: string;
    teamBName?: string;
    teamBTag?: string;
    teamBLogo?: string;
}