"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentProofController = exports.updateRegistrationStatusController = void 0;
const tournaments_service_1 = require("../services/tournaments.service");
const supabase_1 = require("../config/supabase");
const updateRegistrationStatusController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const teamId = parseInt(req.params.teamId);
        const { status } = req.body;
        if (!['approved', 'rejected', 'pending'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be approved, rejected, or pending.' });
        }
        const registration = await (0, tournaments_service_1.updateRegistrationStatus)(tournamentId, teamId, status);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }
        res.status(200).json(registration);
    }
    catch (error) {
        console.error('Error updating registration status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.updateRegistrationStatusController = updateRegistrationStatusController;
const getPaymentProofController = async (req, res) => {
    try {
        const tournamentId = parseInt(req.params.id);
        const teamId = parseInt(req.params.teamId);
        const registration = await (0, tournaments_service_1.getRegistration)(tournamentId, teamId);
        if (!registration) {
            return res.status(404).json({ error: 'Registration not found.' });
        }
        if (!registration.payment_proof_url) {
            return res.status(404).json({ error: 'No payment proof uploaded for this registration.' });
        }
        // Generate Signed URL
        const { data, error } = await supabase_1.supabase
            .storage
            .from('private-assets')
            .createSignedUrl(registration.payment_proof_url, 60); // Valid for 60 seconds
        if (error) {
            throw error;
        }
        res.status(200).json({ signedUrl: data.signedUrl });
    }
    catch (error) {
        console.error('Error getting payment proof:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getPaymentProofController = getPaymentProofController;
//# sourceMappingURL=registrationController.js.map