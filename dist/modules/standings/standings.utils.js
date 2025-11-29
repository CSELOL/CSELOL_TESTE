"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTeamStats = calculateTeamStats;
function calculateTeamStats(standingsMap, match) {
    const { team_a_id, team_b_id, score_a, score_b } = match;
    // Empate
    if (score_a === score_b) {
        standingsMap[team_a_id].draws++;
        standingsMap[team_b_id].draws++;
        standingsMap[team_a_id].points += 1;
        standingsMap[team_b_id].points += 1;
        return;
    }
    // Time A ganhou
    if (score_a > score_b) {
        standingsMap[team_a_id].wins++;
        standingsMap[team_b_id].losses++;
        standingsMap[team_a_id].points += 3;
        return;
    }
    // Time B ganhou
    standingsMap[team_b_id].wins++;
    standingsMap[team_a_id].losses++;
    standingsMap[team_b_id].points += 3;
}
//# sourceMappingURL=standings.utils.js.map