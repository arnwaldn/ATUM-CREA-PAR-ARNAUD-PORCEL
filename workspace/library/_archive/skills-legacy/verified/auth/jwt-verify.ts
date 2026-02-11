/**
 * SKILL: JWT Token Verification
 * @skill jwt-verify
 * @category auth
 * @tags jwt, authentication, token
 * @verified true
 * @success_count 0
 *
 * Verifies and decodes JWT tokens with proper error handling.
 *
 * @dependencies jsonwebtoken
 * @usage
 * ```typescript
 * const payload = await verifyJWT(token, process.env.JWT_SECRET);
 * if (payload) {
 *   console.log('User ID:', payload.userId);
 * }
 * ```
 */

import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  iat: number;
  exp: number;
}

export interface VerifyResult {
  valid: boolean;
  payload?: JWTPayload;
  error?: string;
}

/**
 * Verify a JWT token and return the decoded payload
 * @param token - The JWT token to verify
 * @param secret - The secret key used to sign the token
 * @returns VerifyResult with validity status and payload
 */
export function verifyJWT(token: string, secret: string): VerifyResult {
  try {
    if (!token || !secret) {
      return { valid: false, error: 'Token and secret are required' };
    }

    // Remove Bearer prefix if present
    const cleanToken = token.startsWith('Bearer ')
      ? token.slice(7)
      : token;

    const payload = jwt.verify(cleanToken, secret) as JWTPayload;

    return {
      valid: true,
      payload
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return { valid: false, error: 'Token has expired' };
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return { valid: false, error: 'Invalid token' };
    }
    return { valid: false, error: 'Token verification failed' };
  }
}

/**
 * Generate a JWT token
 * @param payload - The data to encode in the token
 * @param secret - The secret key to sign with
 * @param expiresIn - Token expiration (default: '7d')
 * @returns The signed JWT token
 */
export function generateJWT(
  payload: Omit<JWTPayload, 'iat' | 'exp'>,
  secret: string,
  expiresIn: string = '7d'
): string {
  return jwt.sign(payload, secret, { expiresIn });
}

// Test command: npx vitest run --grep "jwt"
