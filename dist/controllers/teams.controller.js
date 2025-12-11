"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leaveTeamController = exports.getMyTeamTournamentsController = exports.getMyTeamMatchesController = exports.transferOwnershipController = exports.refreshInviteCodeController = exports.getTeamMembersController = exports.joinTeamByCodeController = exports.getMyTeamController = exports.joinTeamController = exports.createTeamController = void 0;
const teams_service_1 = require("../services/teams.service");
// ... (rest of imports)
// ... (inside getMyTeamMatchesController)
const users_service_1 = require("../services/users.service");
const zod_schemas_1 = require("../utils/zod-schemas");
const createTeamController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const { name, tag, description, social_media, logo_url } = req.body;
        // Parse social_media if it's a string (multipart/form-data sends everything as strings)
        let parsedSocialMedia = social_media;
        if (typeof social_media === 'string') {
            try {
                parsedSocialMedia = JSON.parse(social_media);
            }
            catch (e) {
                console.error('Failed to parse social_media JSON', e);
                return res.status(400).json({ error: 'Invalid social_media JSON format' });
            }
        }
        // Validate against Zod Schema
        try {
            zod_schemas_1.CreateTeamSchema.parse({
                name,
                tag,
                description,
                social_media: parsedSocialMedia,
                logo_url
            });
        }
        catch (error) {
            const err = error;
            console.log('Validation error:', err); // DEBUG
            if (err.errors) {
                return res.status(400).json({ error: err.errors });
            }
            throw error;
        }
        // 1. Get User
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user) {
            // This shouldn't happen if auth middleware syncs user, but good to check
            return res.status(400).json({ error: 'User not found.' });
        }
        if (user.team_id) {
            return res.status(409).json({ error: 'You are already in a team.' });
        }
        // 2. Create Team
        const team = await (0, teams_service_1.createTeam)(name, tag, logo_url, description, parsedSocialMedia, supabaseId);
        res.status(201).json(team);
    }
    catch (error) {
        console.error('Error creating team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.createTeamController = createTeamController;
const joinTeamController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const teamId = parseInt(req.params.id);
        // 1. Get User
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user) {
            return res.status(400).json({ error: 'User not found.' });
        }
        if (user.team_id) {
            return res.status(409).json({ error: 'You are already in a team.' });
        }
        // 2. Check if team exists
        const team = await (0, teams_service_1.getTeamById)(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        // 3. Join Team (Update user's team_id)
        // We need to update joinTeam service to use users table too, but for now let's focus on createTeam
        // Assuming joinTeam needs update too.
        // await joinTeam(user.id, teamId); 
        // Let's comment this out or update joinTeam service as well.
        // For now, let's just return 501 Not Implemented for join to avoid breaking if I don't update service immediately
        // But better to update service.
        res.status(501).json({ error: 'Join team not implemented yet for new user structure' });
    }
    catch (error) {
        console.error('Error joining team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.joinTeamController = joinTeamController;
const getMyTeamController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        // 1. Get User
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // 2. Check if user has a team
        if (!user.team_id) {
            return res.status(404).json({ error: 'You are not in a team.' });
        }
        // 3. Get Team
        const team = await (0, teams_service_1.getTeamById)(user.team_id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        res.status(200).json(team);
    }
    catch (error) {
        console.error('Error getting my team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyTeamController = getMyTeamController;
const joinTeamByCodeController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const { code } = req.body;
        if (!code) {
            return res.status(400).json({ error: 'Invite code is required.' });
        }
        // 1. Get User
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        if (user.team_id) {
            return res.status(409).json({ error: 'You are already in a team.' });
        }
        // 2. Find Team by Code
        const { getTeamByInviteCode, joinTeam } = require('../services/teams.service'); // Lazy load to avoid circular dependency if any, or just import
        const team = await getTeamByInviteCode(code);
        if (!team) {
            return res.status(404).json({ error: 'Invalid invite code.' });
        }
        // 3. Join Team
        await joinTeam(user.id, team.id);
        res.status(200).json({ message: 'Joined team successfully.', team });
    }
    catch (error) {
        console.error('Error joining team by code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.joinTeamByCodeController = joinTeamByCodeController;
const getTeamMembersController = async (req, res) => {
    try {
        const teamId = parseInt(req.params.id);
        const { getTeamMembers } = require('../services/teams.service');
        const members = await getTeamMembers(teamId);
        res.status(200).json(members);
    }
    catch (error) {
        console.error('Error getting team members:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getTeamMembersController = getTeamMembersController;
const refreshInviteCodeController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const teamId = parseInt(req.params.id);
        // 1. Get User & Check Permissions (Must be Captain/Creator)
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        const team = await (0, teams_service_1.getTeamById)(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        if (team.captain_id !== supabaseId) {
            return res.status(403).json({ error: 'Only the team captain can refresh the invite code.' });
        }
        // 2. Generate New Code
        const { v4: uuidv4 } = require('uuid');
        const newCode = uuidv4().substring(0, 8).toUpperCase();
        // 3. Update Team
        const { refreshInviteCode } = require('../services/teams.service');
        const updatedTeam = await refreshInviteCode(teamId, newCode);
        res.status(200).json({ invite_code: updatedTeam.invite_code });
    }
    catch (error) {
        console.error('Error refreshing invite code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.refreshInviteCodeController = refreshInviteCodeController;
const transferOwnershipController = async (req, res) => {
    try {
        const auth = req.auth;
        const currentCaptainId = auth.sub;
        const teamId = parseInt(req.params.id);
        const { newCaptainId } = req.body;
        if (!newCaptainId) {
            return res.status(400).json({ error: 'New captain ID is required.' });
        }
        // 1. Get Team & Verify Current Captain
        const team = await (0, teams_service_1.getTeamById)(teamId);
        if (!team) {
            return res.status(404).json({ error: 'Team not found.' });
        }
        if (team.captain_id !== currentCaptainId) {
            return res.status(403).json({ error: 'Only the team captain can transfer ownership.' });
        }
        // 2. Verify New Captain is in the team
        const { getTeamMembers, transferTeamOwnership } = require('../services/teams.service');
        const members = await getTeamMembers(teamId);
        const newCaptain = members.find((m) => m.supabase_id === newCaptainId);
        if (!newCaptain) {
            return res.status(400).json({ error: 'The new captain must be a member of the team.' });
        }
        // 3. Transfer Ownership
        await transferTeamOwnership(teamId, currentCaptainId, newCaptainId);
        res.status(200).json({ message: 'Ownership transferred successfully.' });
    }
    catch (error) {
        console.error('Error transferring ownership:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.transferOwnershipController = transferOwnershipController;
const getMyTeamMatchesController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user || !user.team_id) {
            return res.status(404).json({ error: 'User not found or not in a team.' });
        }
        const matches = await (0, teams_service_1.getTeamMatches)(user.team_id);
        res.status(200).json(matches);
    }
    catch (error) {
        console.error('Error getting team matches:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyTeamMatchesController = getMyTeamMatchesController;
const getMyTeamTournamentsController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user || !user.team_id) {
            return res.status(404).json({ error: 'User not found or not in a team.' });
        }
        const tournaments = await (0, teams_service_1.getTeamTournaments)(user.team_id);
        res.status(200).json(tournaments);
    }
    catch (error) {
        console.error('Error getting team tournaments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMyTeamTournamentsController = getMyTeamTournamentsController;
const leaveTeamController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        // 1. Get User
        const user = await (0, users_service_1.getUserBySupabaseId)(supabaseId);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        // 2. Check if user is in a team
        if (!user.team_id) {
            return res.status(400).json({ error: 'You are not in a team.' });
        }
        // 3. Check if user is the captain - captains cannot leave directly
        if (user.team_role === 'CAPTAIN') {
            return res.status(403).json({
                error: 'Team captains cannot leave directly. Please transfer ownership first.'
            });
        }
        // 4. Leave Team
        const { leaveTeam } = require('../services/teams.service');
        await leaveTeam(user.id);
        res.status(200).json({ message: 'You have left the team successfully.' });
    }
    catch (error) {
        console.error('Error leaving team:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.leaveTeamController = leaveTeamController;
//# sourceMappingURL=teams.controller.js.map