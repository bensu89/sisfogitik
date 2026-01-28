'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { PlusCircle, Folder } from 'lucide-react'
import { Button } from '@/components/ui'
import { TicketList } from '@/components/tickets'
import { supabase } from '@/lib/supabase'
import { Ticket, Category, Profile } from '@/types'

export default function PelaporDashboard() {
    const [tickets, setTickets] = useState<(Ticket & { category?: Category | null })[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                // Load categories
                const { data: cats } = await supabase.from('categories').select('*')
                if (cats) setCategories(cats)

                // Load user's tickets
                const { data: ticketsData } = await supabase
                    .from('tickets')
                    .select(`
            *,
            category:categories(*)
          `)
                    .eq('reporter_id', session.user.id)
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Folder className="w-8 h-8 text-indigo-600" />
                        Tiket Saya
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Kelola dan pantau status tiket yang Anda buat
                    </p>
                </div>
                <Link href="/dashboard/pelapor/create">
                    <Button>
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Buat Tiket Baru
                    </Button>
                </Link>
            </div>

            {/* Ticket List */}
            <TicketList
                tickets={tickets}
                categories={categories}
                emptyMessage="Anda belum membuat tiket apapun"
                ticketHref={(id) => `/dashboard/tickets/${id}`}
            />
        </div>
    )
}
