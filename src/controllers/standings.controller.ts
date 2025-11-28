import { Request, Response, NextFunction } from 'express';
import { getPool } from '../../../db';
import { calculateTeamStats } from './standings.utils';

export async function getStandings(req: Request, res: Response, next: NextFunction) {
  try {
    const { tournamentId } = req.params;

    const pool = getPool();

    // 1. Verifica se o torneio existe
    const tournamentResult = await pool.query(
      `SELECT id, name FROM tournaments WHERE id = $1`,
      [tournamentId]
    );

    if (tournamentResult.rowCount === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    // 2. Busca todos os teams inscritos nesse torneio
    const teamsResult = await pool.query(
      `SELECT t.id, t.name, t.logo_url
       FROM teams t
       INNER JOIN tournament_participants tp ON tp.team_id = t.id
       WHERE tp.tournament_id = $1`,
      [tournamentId]
    );

    const teams = teamsResult.rows;

    // 3. Busca todas as partidas encerradas
    const matchesResult = await pool.query(
      `SELECT id, team_a_id, team_b_id, score_a, score_b
       FROM matches
       WHERE tournament_id = $1 AND status = 'completed'`,
      [tournamentId]
    );

    const matches = matchesResult.rows;

    // 4. Constrói tabela default
    const standingsMap: Record<string, any> = {};

    for (const team of teams) {
      standingsMap[team.id] = {
        teamId: team.id,
        name: team.name,
        logo: team.logo_url,
        wins: 0,
        losses: 0,
        draws: 0,
        points: 0,
      };
    }

    // 5. Calcula estatísticas baseado nos jogos
    for (const match of matches) {
      calculateTeamStats(standingsMap, match);
    }

    // 6. Converte para array e ordena
    const standings = Object.values(standingsMap).sort((a: any, b: any) => {
      // Primeiro por pontos
      if (b.points !== a.points) return b.points - a.points;
      // Depois por vitórias
      if (b.wins !== a.wins) return b.wins - a.wins;
      // Depois saldo (score total)
      const teamAMatchStats = matches.filter((m) => m.team_a_id === a.teamId || m.team_b_id === a.teamId);
      const teamBMatchStats = matches.filter((m) => m.team_a_id === b.teamId || m.team_b_id === b.teamId);

      const scoreA = teamAMatchStats.reduce((acc, m) => {
        const isA = m.team_a_id === a.teamId;
        return acc + (isA ? m.score_a : m.score_b);
      }, 0);

      const scoreB = teamBMatchStats.reduce((acc, m) => {
        const isB = m.team_a_id === b.teamId;
        return acc + (isB ? m.score_a : m.score_b);
      }, 0);

      return scoreB - scoreA;
    });

    return res.json({ tournament: tournamentResult.rows[0], standings });
  } catch (err) {
    next(err);
  }
}
