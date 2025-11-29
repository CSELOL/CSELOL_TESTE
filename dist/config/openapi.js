"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOpenApiDocs = generateOpenApiDocs;
const zod_to_openapi_1 = require("@asteasolutions/zod-to-openapi");
const registry_1 = require("./registry");
require("../utils/zod-schemas"); // Import to register schemas
function generateOpenApiDocs() {
    const generator = new zod_to_openapi_1.OpenApiGeneratorV3(registry_1.registry.definitions);
    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'CSELOL API',
            description: 'Documentação da API do sistema CSELOL',
        },
        servers: [{ url: 'http://localhost:3333' }],
    });
}
//# sourceMappingURL=openapi.js.map