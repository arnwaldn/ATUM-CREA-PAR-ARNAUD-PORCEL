import { NextRequest } from "next/server"
import { success, error, notFound } from "@/lib/api-response"
import { getUser } from "@/lib/auth"
import { updateUserSchema } from "@/lib/validations"
import { prisma } from "@/lib/prisma"

type Params = { params: Promise<{ id: string }> }

// GET /api/v1/users/:id
export async function GET(req: NextRequest, { params }: Params) {
  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return notFound("Utilisateur non trouvé")
  return success(user)
}

// PATCH /api/v1/users/:id
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const authUser = await getUser(req)
  if (!authUser) return error("Non autorisé", 401)

  const body = await req.json()
  const data = updateUserSchema.parse(body)
  const user = await prisma.user.update({ where: { id }, data })
  return success(user)
}

// DELETE /api/v1/users/:id
export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = await params
  const authUser = await getUser(req)
  if (!authUser || authUser.role !== "admin") {
    return error("Non autorisé", 401)
  }
  await prisma.user.delete({ where: { id } })
  return success({ deleted: true })
}
