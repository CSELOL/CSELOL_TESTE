import { db } from '../config/database';

export const createRegistration = async (
    tournamentId: number,
    teamId: number,
    paymentProofUrl: string
) => {
    const result = await db.query(
        `INSERT INTO tournament_registrations (tournament_id, team_id, payment_proof_url)
         VALUES ($1, $2, $3) RETURNING *`,
        [tournamentId, teamId, paymentProofUrl]
    );
    return result.rows[0];
};

export const getRegistration = async (tournamentId: number, teamId: number) => {
    const result = await db.query(
        `SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2`,
        [tournamentId, teamId]
    );
    return result.rows[0];
};
