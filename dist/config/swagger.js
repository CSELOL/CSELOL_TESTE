"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const openapi_1 = require("./openapi");
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const generatedSpec = (0, openapi_1.generateOpenApiDocs)();
const options = {
    definition: generatedSpec,
    apis: [
        "./src/routes/tournaments.routes.ts",
        "./src/routes/teams.routes.ts",
        "./src/routes/matches.routes.ts",
        "./src/routes/standings.routes.ts",
        "./src/controllers/*.ts"
    ],
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map