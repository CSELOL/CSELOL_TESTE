import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tournamentRoutes from './routes/tournamentRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow frontend to connect
app.use(express.json()); // Allow backend to read JSON data
// Use Routes
app.use('/api/tournaments', tournamentRoutes);
// Basic Route
app.get('/', (req, res) => {
  res.send('CSELOL API is Running 🚀');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});