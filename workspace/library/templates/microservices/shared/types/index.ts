// Shared types across microservices

export interface User {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN'
  createdAt: Date
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

export interface Notification {
  id: string
  type: string
  userId: string
  message: string
  read: boolean
  createdAt: Date
}

// Event types for pub/sub
export interface OrderCreatedEvent {
  orderId: string
  userId: string
  total: number
}

export interface UserRegisteredEvent {
  userId: string
  email: string
  name: string
}

// API Response types
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
