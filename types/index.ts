// Re-export database types
export * from '@/lib/database.types'

// Additional application types

export interface NavItem {
    title: string
    href: string
    icon?: string
    badge?: number
    children?: NavItem[]
}

export interface DashboardStats {
    totalTickets: number
    openTickets: number
    inProgressTickets: number
    resolvedTickets: number
}

export interface TicketFilters {
    status?: string
    priority?: string
    category?: string
    search?: string
    dateFrom?: string
    dateTo?: string
}

export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
    field: string
    direction: SortDirection
}

// Form types
export interface CreateTicketForm {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category_id: string
    attachment?: File
}

export interface UpdateTicketForm {
    status?: 'open' | 'in_progress' | 'resolved' | 'closed'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    assignee_id?: string
}

export interface CommentForm {
    content: string
    is_internal?: boolean
}

// Auth types
export interface AuthUser {
    id: string
    email: string
    full_name: string
    role: 'pelapor' | 'admin' | 'teknisi'
    avatar_url?: string
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
    pageSize: number
    totalPages: number
}
