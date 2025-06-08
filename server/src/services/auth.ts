import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

const secretKey = process.env.JWT_SECRET_KEY || '';

// Create a token
export const signToken = (username: string, email: string, _id: unknown): string => {
  const payload = { username, email, _id };
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};

// Apollo context auth middleware
export const authMiddleware = (req: Request) => {
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.slice(7).trim();
  }

  if (!token) {
    return { user: null };
  }

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    return { user: decoded };
  } catch (err) {
    console.error('Invalid token:', err);
    return { user: null };
  }
};

// Express middleware for protected routes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.sendStatus(401); // Unauthorized - return to stop further execution
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, secretKey) as JwtPayload;
    // @ts-ignore
    req.user = decoded;
    return next(); // return here to satisfy TS
  } catch (err) {
    console.error('JWT verification error:', err);
    return res.sendStatus(403); // Forbidden - return here too
  }
};
