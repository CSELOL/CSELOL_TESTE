"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = getUserInfo;
async function getUserInfo(req, res) {
    try {
        // Mais tarde você integrará com Keycloak
        return res.json({ message: 'Auth placeholder — integrate Keycloak later.' });
    }
    catch (err) {
        return res.status(500).json({ error: 'Internal server error' });
    }
}
//# sourceMappingURL=auth.controller.js.map