import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express'
import { MongooseId } from "@shared/types/typeAliases.ts";
import { FORBIDDEN, UNAUTHORIZED } from '../enums/httpStatusCodes.ts';

const decodeAuthHeader = (authHeader: string): TokenPayload => {
  const accessToken = authHeader.split(' ')[1];
  return jwt.verify(accessToken, process.env.JWT_SECRET) as TokenPayload;
}

export function hasAnyRole(roles: string[]): (request: Request, response: Response, next: NextFunction) => void {
  return (request: Request, response: Response, next: NextFunction) => {
    const authorizationHeader = request.headers.authorization

    if (!authorizationHeader) {
      return response.sendStatus(UNAUTHORIZED);
    }
    try {
      /* @ts-ignore: TODO: Add request.user type via a .d.ts file */
      request.user = decodeAuthHeader(authorizationHeader)
      
      if (!request.user?.authRoles.some((role: string) => roles.includes(role))) {
        return response.status(UNAUTHORIZED).send(`You must have one of the following roles to perform this action: ${roles.join(', ')}`);
      }
      return next();
    } catch (error) {
      return response.sendStatus(FORBIDDEN) // Must be a 403 error so the frontend knows to fetch accessToken using refresh token. "I know who you are, but I can't let you in."
    }
  }
}

export function verifyBearerToken(request: Request, response: Response, next) {
  const authorizationHeader = request.headers.authorization

  if (!authorizationHeader) {
    return response.sendStatus(UNAUTHORIZED);
  }
  try {
    /* @ts-ignore: TODO: Add request.user type via a .d.ts file */
    request.user = decodeAuthHeader(authorizationHeader)
    return next();
  } catch (error) {
    return response.sendStatus(FORBIDDEN) // Must be a 403 error so the frontend knows to fetch accessToken using refresh token. "I know who you are, but I can't let you in."
  }
}

export type TokenPayload = {
  _id: MongooseId;
  email: string;
  authRoles: string[];
}

export function generateAccessToken(payload: TokenPayload, secret: string) {
  return jwt.sign(payload, secret, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: TokenPayload, secret: string) {
  return jwt.sign(payload, secret, { expiresIn: '12h' }); // user MUST login once refresh token expires
}