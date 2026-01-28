'use client'

import { useEffect, useState } from 'react'
import { Ticket, Users, BarChart3 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Select } from '@/components/ui'
import { TicketList } from '@/components/tickets'
import { supabase } from '@/lib/supabase'
import { Ticket as TicketType, Category, Profile } from '@/types'

export default function AdminDashboard() {
    const [tickets, setTickets] = useState<(TicketType & { reporter?: Profile; assignee?: Profile | null; category?: Category | null })[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [teknisiList, setTeknisiList] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load categories
                const { data: cats } = await supabase.from('categories').select('*')
                if (cats) setCategories(cats)

                // Load teknisi users
                const { data: teknisis } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'teknisi')
                if (teknisis) setTeknisiList(teknisis)

                // Load all tickets with relations
                const { data: ticketsData } = await supabase
                    .from('tickets')
                    .select(`
            *,
            reporter:profiles!tickets_reporter_id_fkey(*),
            assignee:profiles!tickets_assignee_id_fkey(*),
            category:categories(*)
          `)
                    .order('created_at', { ascending: false })

                if (ticketsData) {
                    setTickets(ticketsData)
                }
            } catch (error) {
                console.error('Error loading data:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [])

    const handleAssign = async (ticketId: string, assigneeId: string) => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabase as any)
                .from('tickets')
                .update({
                    assignee_id: assigneeId,
                    status: 'in_progress'
                })
                .eq('id', ticketId)

            if (error) throw error

            // Refresh tickets
            setTickets(tickets.map(t =>
                t.id === ticketId
                    ? { ...t, assignee_id: assigneeId, status: 'in_progress' as const, assignee: teknisiList.find(tk => tk.id === assigneeId) }
                    : t
            ))
        } catch (error) {
            console.error('Error assigning ticket:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const unassignedTickets = tickets.filter(t => !t.assignee_id && t.status === 'open')

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 lg:gap-3">
                    <Ticket className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                    Kelola Tiket
                </h1>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                    Lihat semua tiket dan tugaskan ke teknisi
                </p>
            </div>

            {/* Quick Stats - horizontal scroll on mobile */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4">
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-red-100 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                            <Ticket className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Belum Ditugaskan</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{unassignedTickets.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <Users className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Teknisi</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{teknisiList.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Total</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{tickets.length}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Unassigned Tickets Alert */}
            {unassignedTickets.length > 0 && (
                <Card variant="bordered" className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                    <CardHeader>
                        <CardTitle className="text-amber-700 dark:text-amber-400">
                            ⚠️ Tiket Menunggu Penugasan ({unassignedTickets.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 lg:space-y-4">
                            {unassignedTickets.slice(0, 5).map((ticket) => (
                                <div key={ticket.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 bg-white dark:bg-gray-900 rounded-xl gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm lg:text-base truncate">{ticket.title}</h4>
                                        <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                                            {ticket.reporter?.full_name} • {new Date(ticket.created_at).toLocaleDateString('id-ID')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 lg:gap-3">
                                        <Select
                                            options={[
                                                { value: '', label: 'Pilih Teknisi' },
                                                ...teknisiList.map(t => ({ value: t.id, label: t.full_name }))
                                            ]}
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    handleAssign(ticket.id, e.target.value)
                                                }
                                            }}
                                            className="flex-1 lg:w-48"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* All Tickets */}
            <TicketList
                tickets={tickets}
                categories={categories}
                ticketHref={(id) => `/dashboard/tickets/${id}`}
            />
        </div>
    )
}
