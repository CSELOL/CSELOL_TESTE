import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
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

export const swaggerSpec = swaggerJSDoc(options);
