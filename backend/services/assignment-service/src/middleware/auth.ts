import express from 'express';
import jwt from 'jsonwebtoken';

export function auth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretjwtkey123') as any;
    (req as any).user = decoded;
    next();
  } catch { 
    res.status(401).json({ error: 'Invalid token' }); 
  }
}

export function requireRole(...roles: string[]) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!roles.includes(userRole)) {
      return res.status(403).json({ error: `Forbidden: requires one of [${roles.join(', ')}]` });
    }
    next();
  };
}
