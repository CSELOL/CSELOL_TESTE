import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET ALL
export const getTournaments = async (req: Request, res: Response) => {
  try {
    const tournaments = await prisma.tournament.findMany();
    res.json(tournaments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tournaments" });
  }
};

// CREATE NEW
export const createTournament = async (req: Request, res: Response) => {
  try {
    const { name, date, prize, slots, img, status } = req.body;
    
    const newTournament = await prisma.tournament.create({
      data: {
        name,
        date,
        prize,
        slots,
        img,
        status
      }
    });
    
    res.status(201).json(newTournament);
  } catch (error) {
    res.status(500).json({ error: "Failed to create tournament" });
  }
};