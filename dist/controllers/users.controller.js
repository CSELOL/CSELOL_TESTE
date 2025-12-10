"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeController = void 0;
const users_service_1 = require("../services/users.service");
const getMeController = async (req, res) => {
    try {
        const auth = req.auth;
        const supabaseId = auth.sub;
        const user = await (0, users_service_1.getUserMe)(supabaseId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.getMeController = getMeController;
//# sourceMappingURL=users.controller.js.map