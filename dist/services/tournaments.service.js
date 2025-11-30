"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRegistration = exports.updateRegistrationStatus = exports.registerTeam = void 0;
exports.createTournament = createTournament;
exports.getTournaments = getTournaments;
exports.getTournamentById = getTournamentById;
exports.updateTournament = updateTournament;
exports.deleteTournament = deleteTournament;
const database_1 = require("../config/database");
async function createTournament(data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    INSERT INTO tournaments 
      (tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status, created_at, updated_at)
    VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived || false, // Default to false if not provided
        status
    ];
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
async function getTournaments() {
    const result = await database_1.db.query(`
    SELECT * FROM tournaments ORDER BY created_at DESC
  `);
    return result.rows;
}
async function getTournamentById(id) {
    const result = await database_1.db.query(`
    SELECT * FROM tournaments WHERE id = $1
  `, [id]);
    return result.rows[0];
}
async function updateTournament(id, data) {
    const { tournament_name, tournament_description, banner_url, logo_url, format, has_lower_bracket, start_date, is_listed, allow_signups, is_archived, status } = data;
    const query = `
    UPDATE tournaments
    SET
      tournament_name = COALESCE($1, tournament_name),
      tournament_description = COALESCE($2, tournament_description),
      banner_url = COALESCE($3, banner_url),
      logo_url = COALESCE($4, logo_url),
      format = COALESCE($5, format),
      has_lower_bracket = COALESCE($6, has_lower_bracket),
      start_date = COALESCE($7, start_date),
      is_listed = COALESCE($8, is_listed),
      allow_signups = COALESCE($9, allow_signups),
      is_archived = COALESCE($10, is_archived),
      status = COALESCE($11, status),
      updated_at = NOW()
    WHERE id = $12
    RETURNING *;
  `;
    const values = [
        tournament_name,
        tournament_description,
        banner_url,
        logo_url,
        format,
        has_lower_bracket,
        start_date,
        is_listed,
        allow_signups,
        is_archived,
        status,
        id
    ].map(val => val === undefined ? null : val);
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
async function deleteTournament(id) {
    const query = `
    DELETE FROM tournaments
    WHERE id = $1
    RETURNING *;
  `;
    const values = [id];
    const result = await database_1.db.query(query, values);
    return result.rows[0];
}
const registerTeam = async (tournamentId, teamId, paymentProofUrl) => {
    const client = await database_1.db.connect();
    try {
        await client.query('BEGIN');
        // 1. Check if tournament exists and is open
        const tournamentRes = await client.query('SELECT * FROM tournaments WHERE id = $1', [tournamentId]);
        if (tournamentRes.rows.length === 0) {
            throw new Error('Tournament not found');
        }
        const tournament = tournamentRes.rows[0];
        // Check status (assuming 'open' or 'draft' allows registration, adjust as needed)
        // if (tournament.status !== 'open') { throw new Error('Tournament is not open for registration'); }
        // 2. Check if team is already registered
        const existingReg = await client.query('SELECT * FROM tournament_registrations WHERE tournament_id = $1 AND team_id = $2', [tournamentId, teamId]);
        if (existingReg.rows.length > 0) {
            throw new Error('Team is already registered for this tournament');
        }
        // 3. Register Team
        // Default status 'pending'
        const result = await client.query(`INSERT INTO tournament_registrations (tournament_id, team_id, payment_proof_url, status)
       VALUES ($1, $2, $3, 'pending')
       RETURNING *`, [tournamentId, teamId, paymentProofUrl]);
        await client.query('COMMIT');
        return result.rows[0];
    }
    catch (e) {
        await client.query('ROLLBACK');
        throw e;
    }
    finally {
        client.release();
    }
};
exports.registerTeam = registerTeam;
const updateRegistrationStatus = async (tournamentId, teamId, status) => {
    const result = await database_1.db.query(`UPDATE tournament_registrations 
     SET status = $1, updated_at = NOW() 
     WHERE tournament_id = $2 AND team_id = $3 
     RETURNING *`, [status, tournamentId, teamId]);
    return result.rows[0];
};
exports.updateRegistrationStatus = updateRegistrationStatus;
const getRegistration = async (tournamentId, teamId) => {
    const result = await database_1.db.query(`SELECT * FROM tournament_registrations 
     WHERE tournament_id = $1 AND team_id = $2`, [tournamentId, teamId]);
    return result.rows[0];
};
exports.getRegistration = getRegistration;
//# sourceMappingURL=tournaments.service.js.map