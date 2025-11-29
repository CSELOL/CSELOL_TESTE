import express from "express";
import cors from 'cors';
import tournamentRoutes from "./routes/tournaments.routes";
import teamRoutes from "./routes/teams.routes";
import matchRoutes from "./routes/matches.routes";
import standingsRoutes from "./routes/standings.routes";

const app = express();

// CORS PRIMEIRO
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// routes
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/standings", standingsRoutes);

export default app;
