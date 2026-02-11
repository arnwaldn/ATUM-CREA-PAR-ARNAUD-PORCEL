import { NextResponse } from "next/server"

export type ApiResponse<T = unknown> = {
  success: boolean
  data?: T
  error?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export function success<T>(data: T, meta?: ApiResponse["meta"]) {
  return NextResponse.json<ApiResponse<T>>({
    success: true,
    data,
    meta,
  })
}

export function error(message: string, status = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error: message },
    { status }
  )
}

export function unauthorized(message = "Non autorisé") {
  return error(message, 401)
}

export function forbidden(message = "Accès interdit") {
  return error(message, 403)
}

export function notFound(message = "Ressource non trouvée") {
  return error(message, 404)
}

export function serverError(message = "Erreur serveur") {
  return error(message, 500)
}
