import express from "express";
import tournamentRoutes from "./routes/tournaments.routes";
import cors from 'cors';

const app = express();

// CORS PRIMEIRO
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// routes
app.use("/tournaments", tournamentRoutes);

export default app;
