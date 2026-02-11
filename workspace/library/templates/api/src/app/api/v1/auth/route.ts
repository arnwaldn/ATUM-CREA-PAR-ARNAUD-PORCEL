import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { signToken } from "@/lib/auth"
import { loginSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"

// POST /api/v1/auth - Login
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return error("Identifiants invalides", 401)
    }

    // TODO: Vérifier le mot de passe avec bcrypt
    // const valid = await bcrypt.compare(password, user.password)

    const token = await signToken({
      sub: user.id,
      email: user.email,
      role: "user",
    })

    return success({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch {
    return error("Identifiants invalides", 401)
  }
}
