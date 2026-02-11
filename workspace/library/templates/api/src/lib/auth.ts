import { jwtVerify, SignJWT } from "jose"
import { NextRequest } from "next/server"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "secret")

export type JWTPayload = {
  sub: string
  email: string
  role: "user" | "admin"
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JWTPayload
  } catch {
    return null
  }
}

export async function getUser(req: NextRequest): Promise<JWTPayload | null> {
  const authHeader = req.headers.get("authorization")
  if (!authHeader?.startsWith("Bearer ")) return null
  
  const token = authHeader.slice(7)
  return verifyToken(token)
}

export function requireAuth(handler: Function) {
  return async (req: NextRequest, ctx: unknown) => {
    const user = await getUser(req)
    if (!user) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }
    return handler(req, ctx, user)
  }
}
