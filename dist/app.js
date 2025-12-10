"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const tournaments_routes_1 = __importDefault(require("./routes/tournaments.routes"));
const teams_routes_1 = __importDefault(require("./routes/teams.routes"));
const matches_routes_1 = __importDefault(require("./routes/matches.routes"));
const standings_routes_1 = __importDefault(require("./routes/standings.routes"));
const users_routes_1 = __importDefault(require("./routes/users.routes"));
const files_routes_1 = __importDefault(require("./routes/files.routes"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const openapi_1 = require("./config/openapi");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Serve Static Files
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../public/uploads')));
// Generate Swagger Docs
const swaggerDocs = (0, openapi_1.generateOpenApiDocs)();
// Swagger UI
app.use('/docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs, {
    swaggerOptions: {
        defaultModelsExpandDepth: -1,
        docExpansion: 'list'
    }
}));
// API Routes
app.use('/api/tournaments', tournaments_routes_1.default);
app.use('/api/teams', teams_routes_1.default);
app.use('/api/matches', matches_routes_1.default);
app.use('/api/standings', standings_routes_1.default);
app.use('/api/users', users_routes_1.default);
app.use('/api/files', files_routes_1.default);
// Global Error Handler
app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        console.error('Auth Error:', err.message); // Log the specific auth error
        return res.status(401).json({ error: 'Invalid Token', details: err.message });
    }
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
});
exports.default = app;
//# sourceMappingURL=app.js.map