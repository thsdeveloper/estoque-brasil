import * as jose from 'jose';
import { env } from '../../config/env.js';
import { JWTClaims } from '@estoque-brasil/types';
import { InvalidTokenError, TokenExpiredError } from '../../domain/errors/DomainError.js';

let jwksCache: jose.JWTVerifyGetKey | null = null;

function getJWKS(): jose.JWTVerifyGetKey {
  if (!jwksCache) {
    const jwksUrl = new URL(`${env.SUPABASE_URL}/auth/v1/.well-known/jwks.json`);
    jwksCache = jose.createRemoteJWKSet(jwksUrl);
  }
  return jwksCache;
}

export async function verifyJWT(token: string): Promise<JWTClaims> {
  try {
    const JWKS = getJWKS();
    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `${env.SUPABASE_URL}/auth/v1`,
      audience: 'authenticated',
    });
    return payload as unknown as JWTClaims;
  } catch (error) {
    if (error instanceof jose.errors.JWTExpired) {
      throw new TokenExpiredError();
    }
    console.error('[JWT Verify] Token validation failed:', error instanceof Error ? error.message : error);
    console.error('[JWT Verify] Error type:', error instanceof Error ? error.constructor.name : typeof error);
    throw new InvalidTokenError();
  }
}

export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  return parts[1];
}
