import app from "./app";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    defaultModelsExpandDepth: 10, // Expand schemas in the "Schemas" section
    defaultModelExpandDepth: 10,  // Expand models in responses/requests
  }
}));


dotenv.config();

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🔥 Server running on port ${PORT}`);
});
