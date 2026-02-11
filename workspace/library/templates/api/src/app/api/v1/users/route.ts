import { NextRequest } from "next/server"
import { success, error } from "@/lib/api-response"
import { getUser } from "@/lib/auth"
import { createUserSchema, paginationSchema, parseQuery } from "@/lib/validations"
import { prisma } from "@/lib/prisma"

// GET /api/v1/users
export async function GET(req: NextRequest) {
  const user = await getUser(req)
  if (!user || user.role !== "admin") {
    return error("Non autorisé", 401)
  }

  const { page, limit } = parseQuery(paginationSchema, req.nextUrl.searchParams)
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    prisma.user.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
    prisma.user.count(),
  ])

  return success(users, { page, limit, total })
}

// POST /api/v1/users
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createUserSchema.parse(body)

    const user = await prisma.user.create({ data })
    return success({ id: user.id, email: user.email })
  } catch {
    return error("Données invalides", 400)
  }
}
