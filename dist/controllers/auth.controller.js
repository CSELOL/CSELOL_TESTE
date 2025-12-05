"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = getUserInfo;
async function getUserInfo(req, res) {
    try {
        // Auth is now handled via Supabase JWT middleware
        const auth = req.auth;
        if (!auth) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        return res.json({
            sub: auth.sub,
            email: auth.email,
            user_metadata: auth.user_metadata
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=auth.controller.js.map