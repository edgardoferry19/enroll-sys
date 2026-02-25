import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    username: string;
    role: string;
  };
}

// Middleware to authenticate JWT tokens. If DEV_AUTH_BYPASS=true, fall back to dev user.
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const devBypass = process.env.DEV_AUTH_BYPASS === 'true';
  if (devBypass) {
    req.user = { id: 1, username: 'dev', role: 'superadmin' };
    return next();
  }

  const authHeader = req.headers.authorization || req.headers.Authorization as string | undefined;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const secret = process.env.JWT_SECRET || 'secret';
    const payload: any = jwt.verify(token, secret);
    req.user = { id: payload.id, username: payload.username, role: payload.role };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!roles || roles.length === 0) return next();
    if (!req.user) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (roles.includes(req.user.role)) return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  };
};
