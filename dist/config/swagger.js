"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CSELOL API",
            version: "1.0.0",
            description: "Documentação da API do sistema CSELOL",
        },
        servers: [
            {
                url: "http://localhost:3333",
            },
        ],
    },
    apis: ["./src/routes/*.ts", "./src/controllers/*.ts"], // arquivos que terão doc
};
exports.swaggerSpec = (0, swagger_jsdoc_1.default)(options);
//# sourceMappingURL=swagger.js.map