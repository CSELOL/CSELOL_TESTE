import { Request, Response, NextFunction } from 'express';
import { ZodType } from 'zod';

export function validateBody(schema: ZodType<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.format(),
      });
    }
    req.body = result.data;
    next();
  };
}
