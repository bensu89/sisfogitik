'use client'

import { useState } from 'react'
import { Search, Filter, X } from 'lucide-react'
import { Input, Select, Button } from '@/components/ui'
import { TicketCard } from './ticket-card'
import { Ticket, Profile, Category, TicketFilters } from '@/types'

interface TicketListProps {
    tickets: (Ticket & {
        reporter?: Profile
        assignee?: Profile | null
        category?: Category | null
    })[]
    categories: Category[]
    showFilters?: boolean
    emptyMessage?: string
    ticketHref?: (id: string) => string
}

export function TicketList({
    tickets,
    categories,
    showFilters = true,
    emptyMessage = 'Tidak ada tiket ditemukan',
    ticketHref
}: TicketListProps) {
    const [filters, setFilters] = useState<TicketFilters>({
        status: '',
        priority: '',
        category: '',
        search: '',
    })
    const [showFilterPanel, setShowFilterPanel] = useState(false)

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'open', label: 'Buka' },
        { value: 'in_progress', label: 'Dalam Proses' },
        { value: 'resolved', label: 'Selesai' },
        { value: 'closed', label: 'Ditutup' },
    ]

    const priorityOptions = [
        { value: '', label: 'Semua Prioritas' },
        { value: 'low', label: 'Rendah' },
        { value: 'medium', label: 'Sedang' },
        { value: 'high', label: 'Tinggi' },
        { value: 'urgent', label: 'Urgent' },
    ]

    const categoryOptions = [
        { value: '', label: 'Semua Kategori' },
        ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ]

    const filteredTickets = tickets.filter((ticket) => {
        if (filters.status && ticket.status !== filters.status) return false
        if (filters.priority && ticket.priority !== filters.priority) return false
        if (filters.category && ticket.category_id !== filters.category) return false
        if (filters.search) {
            const search = filters.search.toLowerCase()
            const matchTitle = ticket.title.toLowerCase().includes(search)
            const matchDesc = ticket.description.toLowerCase().includes(search)
            if (!matchTitle && !matchDesc) return false
        }
        return true
    })

    const hasActiveFilters = filters.status || filters.priority || filters.category || filters.search

    const clearFilters = () => {
        setFilters({ status: '', priority: '', category: '', search: '' })
    }

    return (
        <div className="space-y-6">
            {showFilters && (
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                                placeholder="Cari tiket..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant={showFilterPanel ? 'primary' : 'outline'}
                            onClick={() => setShowFilterPanel(!showFilterPanel)}
                        >
                            <Filter className="w-5 h-5" />
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" onClick={clearFilters}>
                                <X className="w-5 h-5" />
                            </Button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilterPanel && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                            <Select
                                label="Status"
                                options={statusOptions}
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            />
                            <Select
                                label="Prioritas"
                                options={priorityOptions}
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            />
                            <Select
                                label="Kategori"
                                options={categoryOptions}
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Results count */}
            <div className="text-sm text-gray-500 dark:text-gray-400">
                {filteredTickets.length} tiket ditemukan
            </div>

            {/* Ticket List */}
            <div className="space-y-4">
                {filteredTickets.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
                    </div>
                ) : (
                    filteredTickets.map((ticket) => (
                        <TicketCard
                            key={ticket.id}
                            ticket={ticket}
                            href={ticketHref ? ticketHref(ticket.id) : undefined}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
