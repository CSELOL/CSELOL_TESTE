"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tournaments_routes_1 = __importDefault(require("./routes/tournaments.routes"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
// CORS PRIMEIRO
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
// routes
app.use("/tournaments", tournaments_routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map