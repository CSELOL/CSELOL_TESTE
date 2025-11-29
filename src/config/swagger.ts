import { generateOpenApiDocs } from "./openapi";
import swaggerJSDoc from "swagger-jsdoc";

const generatedSpec = generateOpenApiDocs();

const options: swaggerJSDoc.Options = {
    definition: generatedSpec as any,
    apis: [
        "./src/routes/tournaments.routes.ts",
        "./src/routes/teams.routes.ts",
        "./src/routes/matches.routes.ts",
        "./src/routes/standings.routes.ts",
        "./src/controllers/*.ts"
    ],
};

export const swaggerSpec = swaggerJSDoc(options);
