/**
 * Type-safe Chrome Storage API wrapper
 */

type StorageArea = 'local' | 'sync' | 'session'

class Storage {
  private area: StorageArea

  constructor(area: StorageArea = 'local') {
    this.area = area
  }

  private get store() {
    return chrome.storage[this.area]
  }

  /**
   * Get a value from storage
   */
  async get<T>(key: string): Promise<T | undefined> {
    return new Promise((resolve) => {
      this.store.get(key, (result) => {
        resolve(result[key] as T | undefined)
      })
    })
  }

  /**
   * Get multiple values from storage
   */
  async getMultiple<T extends Record<string, unknown>>(keys: (keyof T)[]): Promise<Partial<T>> {
    return new Promise((resolve) => {
      this.store.get(keys as string[], (result) => {
        resolve(result as Partial<T>)
      })
    })
  }

  /**
   * Set a value in storage
   */
  async set<T>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      this.store.set({ [key]: value }, resolve)
    })
  }

  /**
   * Set multiple values in storage
   */
  async setMultiple(items: Record<string, unknown>): Promise<void> {
    return new Promise((resolve) => {
      this.store.set(items, resolve)
    })
  }

  /**
   * Remove a key from storage
   */
  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      this.store.remove(key, resolve)
    })
  }

  /**
   * Remove multiple keys from storage
   */
  async removeMultiple(keys: string[]): Promise<void> {
    return new Promise((resolve) => {
      this.store.remove(keys, resolve)
    })
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    return new Promise((resolve) => {
      this.store.clear(resolve)
    })
  }

  /**
   * Watch for changes to a specific key
   */
  watch<T>(key: string, callback: (newValue: T | undefined, oldValue: T | undefined) => void) {
    const listener = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === this.area && changes[key]) {
        callback(changes[key].newValue as T, changes[key].oldValue as T)
      }
    }

    chrome.storage.onChanged.addListener(listener)

    // Return unsubscribe function
    return () => chrome.storage.onChanged.removeListener(listener)
  }

  /**
   * Get all keys in storage
   */
  async getAll(): Promise<Record<string, unknown>> {
    return new Promise((resolve) => {
      this.store.get(null, (result) => {
        resolve(result)
      })
    })
  }

  /**
   * Get storage usage in bytes
   */
  async getBytesInUse(keys?: string | string[]): Promise<number> {
    return new Promise((resolve) => {
      this.store.getBytesInUse(keys ?? null, (bytes) => {
        resolve(bytes)
      })
    })
  }
}

// Export pre-configured instances
export const storage = new Storage('local')
export const syncStorage = new Storage('sync')
export const sessionStorage = new Storage('session')
