import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

/**
 * Middleware para verificar token JWT
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    // Agregar información del usuario al request
    (req as AuthRequest).userId = decoded.userId;
    (req as AuthRequest).userEmail = decoded.email;

    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido o expirado' });
    return;
  }
};

/**
 * Middleware opcional para verificar token (no falla si no hay token)
 */
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: string;
        email: string;
      };

      (req as AuthRequest).userId = decoded.userId;
      (req as AuthRequest).userEmail = decoded.email;
    } catch (error) {
      // Token inválido, pero continuamos sin autenticación
    }
  }

  next();
};
