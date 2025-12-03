import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';
import '../utils/zod-schemas'; // Import to register schemas
import './openapi-routes'; // Import to register paths

export function generateOpenApiDocs() {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: 'CSELOL API',
            description: 'Documentação da API do sistema CSELOL',
        },
        servers: [{ url: 'http://localhost:3333/api' }],
    });
}
