import { TokenPayload } from '../api/middleware/authorize';

declare global {
  namespace Express {
    interface Request {
      user: TokenPayload;
    }
  }
} 