import { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

type ClientType = 'browser' | 'server'

/**
 * Unified Supabase client abstraction
 * Provides a consistent API for both browser and server contexts
 */
export class SupabaseUnifiedClient {
  private client: SupabaseClient<Database>
  private clientType: ClientType

  constructor(client: SupabaseClient<Database>, clientType: ClientType) {
    this.client = client
    this.clientType = clientType
  }

  // ============================================
  // AUTH METHODS
  // ============================================

  async signIn(email: string, password: string) {
    return this.client.auth.signInWithPassword({ email, password })
  }

  async signUp(email: string, password: string) {
    return this.client.auth.signUp({ email, password })
  }

  async signOut() {
    return this.client.auth.signOut()
  }

  async getUser() {
    return this.client.auth.getUser()
  }

  async getSession() {
    return this.client.auth.getSession()
  }

  // ============================================
  // MFA METHODS
  // ============================================

  async enrollMFA() {
    return this.client.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'TOTP Authenticator'
    })
  }

  async verifyMFA(factorId: string, code: string) {
    return this.client.auth.mfa.verify({
      factorId,
      code,
      challengeId: ''
    })
  }

  async getMFAFactors() {
    return this.client.auth.mfa.listFactors()
  }

  async unenrollMFA(factorId: string) {
    return this.client.auth.mfa.unenroll({ factorId })
  }

  // ============================================
  // STORAGE METHODS
  // ============================================

  async uploadFile(userId: string, filename: string, file: File) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    })
  }

  async downloadFile(userId: string, filename: string) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').download(path)
  }

  async deleteFile(userId: string, filename: string) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').remove([path])
  }

  async listFiles(userId: string, folder?: string) {
    const path = folder ? `${userId}/${folder}` : userId
    return this.client.storage.from('files').list(path)
  }

  async getSignedUrl(userId: string, filename: string, expiresIn: number = 3600) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').createSignedUrl(path, expiresIn)
  }

  async getPublicUrl(userId: string, filename: string) {
    const path = `${userId}/${filename}`
    return this.client.storage.from('files').getPublicUrl(path)
  }

  // ============================================
  // DATABASE METHODS
  // ============================================

  from<T extends keyof Database['public']['Tables']>(table: T) {
    return this.client.from(table)
  }

  // Generic query helper
  async query<T>(
    table: keyof Database['public']['Tables'],
    options?: {
      select?: string
      filter?: Record<string, unknown>
      order?: { column: string; ascending?: boolean }
      limit?: number
      offset?: number
    }
  ) {
    let query = this.client.from(table).select(options?.select || '*')

    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value)
      })
    }

    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true
      })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
    }

    return query
  }

  // ============================================
  // REALTIME METHODS
  // ============================================

  subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*' = '*'
  ) {
    return this.client
      .channel(`table-${table}`)
      .on(
        'postgres_changes',
        { event, schema: 'public', table },
        callback
      )
      .subscribe()
  }

  unsubscribe(channel: ReturnType<typeof this.client.channel>) {
    return this.client.removeChannel(channel)
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  getClientType() {
    return this.clientType
  }

  getRawClient() {
    return this.client
  }
}

// Factory functions
export function createUnifiedBrowserClient(client: SupabaseClient<Database>) {
  return new SupabaseUnifiedClient(client, 'browser')
}

export function createUnifiedServerClient(client: SupabaseClient<Database>) {
  return new SupabaseUnifiedClient(client, 'server')
}
