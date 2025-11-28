import express from "express";
import tournamentRoutes from "./routes/tournaments.routes";

const app = express();

app.use(express.json());

// routes
app.use("/tournaments", tournamentRoutes);

export default app;
