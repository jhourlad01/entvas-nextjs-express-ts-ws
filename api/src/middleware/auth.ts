import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

interface AuthUser {
  sub: string;
  email: string;
  name: string;
  role?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

interface AuthRequest extends Request {
  user?: AuthUser;
}

const client = jwksClient({
  jwksUri: `https://${process.env['AUTH0_DOMAIN']}/.well-known/jwks.json`
});

function getKey(header: jwt.JwtHeader, callback: (err: Error | null, key?: string) => void) {
  if (!header.kid) {
    callback(new Error('No key ID in token header'), undefined);
    return;
  }
  
  client.getSigningKey(header.kid, (_err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
    return;
  }

  try {
    const audience = process.env['AUTH0_AUDIENCE'];
    const issuer = `https://${process.env['AUTH0_DOMAIN']}/`;

    jwt.verify(token, getKey, {
      audience,
      issuer,
      algorithms: ['RS256']
    }, (err: jwt.VerifyErrors | null, decoded: string | jwt.JwtPayload | undefined) => {
      if (err || !decoded || typeof decoded === 'string') {
        res.status(403).json({ 
          success: false, 
          error: 'Invalid or expired token' 
        });
        return;
      }
      
      req.user = decoded as AuthUser;
      next();
    });
  } catch {
    res.status(403).json({ 
      success: false, 
      error: 'Invalid or expired token' 
    });
  }
};

export const requireRole = (requiredRole: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ 
        success: false, 
        error: 'Authentication required' 
      });
      return;
    }

    if (req.user.role !== requiredRole && req.user.role !== 'admin') {
      res.status(403).json({ 
        success: false, 
        error: 'Insufficient permissions' 
      });
      return;
    }

    next();
  };
}; 