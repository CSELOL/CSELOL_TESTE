import express from "express";
import cors from 'cors';
import path from 'path';
import tournamentRoutes from './routes/tournaments.routes';
import teamRoutes from './routes/teams.routes';
import matchRoutes from './routes/matches.routes';
import standingRoutes from './routes/standings.routes';
import userRoutes from './routes/users.routes';
import fileRoutes from './routes/files.routes';
import swaggerUi from 'swagger-ui-express';
import { generateOpenApiDocs } from './config/openapi';

const app = express();

app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Serve Static Files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Generate Swagger Docs
const swaggerDocs = generateOpenApiDocs();

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, {
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
    docExpansion: 'list'
  }
}));

// API Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/standings', standingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err.name === 'UnauthorizedError') {
    console.error('Auth Error:', err.message); // Log the specific auth error
    return res.status(401).json({ error: 'Invalid Token', details: err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal Server Error' });
});

export default app;
