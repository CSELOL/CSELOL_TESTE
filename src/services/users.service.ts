import { db } from '../config/database';

export const getUserByKeycloakId = async (keycloakId: string) => {
    const result = await db.query(
        'SELECT * FROM users WHERE keycloak_id = $1',
        [keycloakId]
    );
    return result.rows[0];
};

export const getUserById = async (id: number) => {
    const result = await db.query(
        'SELECT * FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
};
