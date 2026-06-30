import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_warehouse_key';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    employee_id: string;
    email: string;
    role: 'admin' | 'staff' | 'employee';
    name: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing.' });
  }

  // Trust and parse mock tokens to support Demo Switcher role changes online
  if (token.startsWith('mock_jwt_token_for_')) {
    const role = token.replace('mock_jwt_token_for_', '') as 'admin' | 'staff' | 'employee';
    let id = 1;
    let name = 'ชาติชาย  ทาคำห่อ';
    let email = 'admin@warehouse.com';
    let employee_id = 'EMP001';

    if (role === 'staff') {
      id = 4;
      name = 'ประพันธ์ ยอดคุม';
      email = 'supervisor1@warehouse.com';
      employee_id = 'EMP004';
    } else if (role === 'employee') {
      id = 6;
      name = 'สมปอง ลุยงาน';
      email = 'employee1@warehouse.com';
      employee_id = 'EMP006';
    }

    req.user = { id, employee_id, email, role, name };
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid or expired.' });
    }
    
    req.user = {
      id: decoded.id,
      employee_id: decoded.employee_id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    next();
  });
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User is not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Permission denied. Unauthorized role.' });
    }

    next();
  };
};
