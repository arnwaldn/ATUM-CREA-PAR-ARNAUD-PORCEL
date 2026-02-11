import { z } from "zod"

// User schemas
export const createUserSchema = z.object({
  email: z.string().email("Email invalide"),
  name: z.string().min(2, "Nom trop court").max(100),
  password: z.string().min(8, "Mot de passe trop court"),
})

export const updateUserSchema = createUserSchema.partial()

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

// Resource schemas (exemple générique)
export const createResourceSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
})

export const updateResourceSchema = createResourceSchema.partial()

// Query params
export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
})

// Helper pour valider les query params
export function parseQuery<T extends z.ZodSchema>(
  schema: T,
  searchParams: URLSearchParams
): z.infer<T> {
  const obj = Object.fromEntries(searchParams.entries())
  return schema.parse(obj)
}
