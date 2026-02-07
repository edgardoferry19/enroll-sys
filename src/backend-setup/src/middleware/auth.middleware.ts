import { Request, Response, NextFunction } from 'express';
// Authentication bypass: hardcoded dev user (no JWT validation)

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, _res: Response, next: NextFunction) => {
  // Hardcoded bypass: every request is treated as a dev superadmin user
  req.user = { id: 1, username: 'dev', role: 'superadmin' };
  next();
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Auth bypass: allow all roles and unauthenticated access in dev
    next();
  };
};
