export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type UserRole = 'pelapor' | 'admin' | 'teknisi'
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    full_name: string
                    role: UserRole
                    avatar_url: string | null
                    phone: string | null
                    department: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    full_name: string
                    role?: UserRole
                    avatar_url?: string | null
                    phone?: string | null
                    department?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    full_name?: string
                    role?: UserRole
                    avatar_url?: string | null
                    phone?: string | null
                    department?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            categories: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    color: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    color?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    color?: string
                    created_at?: string
                }
            }
            tickets: {
                Row: {
                    id: string
                    title: string
                    description: string
                    status: TicketStatus
                    priority: TicketPriority
                    category_id: string | null
                    reporter_id: string
                    assignee_id: string | null
                    attachment_url: string | null
                    created_at: string
                    updated_at: string
                    resolved_at: string | null
                }
                Insert: {
                    id?: string
                    title: string
                    description: string
                    status?: TicketStatus
                    priority?: TicketPriority
                    category_id?: string | null
                    reporter_id: string
                    assignee_id?: string | null
                    attachment_url?: string | null
                    created_at?: string
                    updated_at?: string
                    resolved_at?: string | null
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string
                    status?: TicketStatus
                    priority?: TicketPriority
                    category_id?: string | null
                    reporter_id?: string
                    assignee_id?: string | null
                    attachment_url?: string | null
                    created_at?: string
                    updated_at?: string
                    resolved_at?: string | null
                }
            }
            ticket_comments: {
                Row: {
                    id: string
                    ticket_id: string
                    user_id: string
                    content: string
                    is_internal: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    ticket_id: string
                    user_id: string
                    content: string
                    is_internal?: boolean
                    created_at?: string
                }
                Update: {
                    id?: string
                    ticket_id?: string
                    user_id?: string
                    content?: string
                    is_internal?: boolean
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: UserRole
            ticket_status: TicketStatus
            ticket_priority: TicketPriority
        }
    }
}

// Helper types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
export type TicketComment = Database['public']['Tables']['ticket_comments']['Row']

// Extended types with relations
export type TicketWithRelations = Ticket & {
    reporter: Profile
    assignee: Profile | null
    category: Category | null
    comments: (TicketComment & { user: Profile })[]
}
