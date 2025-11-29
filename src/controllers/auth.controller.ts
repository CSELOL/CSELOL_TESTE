import { Request, Response } from 'express';

export async function getUserInfo(req: Request, res: Response) {
  try {
    // Mais tarde você integrará com Keycloak
    return res.json({ message: 'Auth placeholder — integrate Keycloak later.' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
