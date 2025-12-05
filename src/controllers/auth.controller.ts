import { Request, Response } from 'express';

export async function getUserInfo(req: Request, res: Response) {
  try {
    // Auth is now handled via Supabase JWT middleware
    const auth = (req as any).auth;
    if (!auth) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    return res.json({
      sub: auth.sub,
      email: auth.email,
      user_metadata: auth.user_metadata
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
