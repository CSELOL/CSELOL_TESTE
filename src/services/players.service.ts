import { db as pool } from '../config/database';

export const createPlayer = async (
    keycloakId: string,
    username: string,
    summonerName?: string,
    role?: string
) => {
    const result = await pool.query(
        `INSERT INTO players (keycloak_id, username, summoner_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
        [keycloakId, username, summonerName, role]
    );
    return result.rows[0];
};

export const getPlayerByKeycloakId = async (keycloakId: string) => {
    const result = await pool.query(
        `SELECT * FROM players WHERE keycloak_id = $1`,
        [keycloakId]
    );
    console.error(`DEBUG: getPlayerByKeycloakId result for ${keycloakId}:`, result.rows[0]);
    return result.rows[0] || null;
};
