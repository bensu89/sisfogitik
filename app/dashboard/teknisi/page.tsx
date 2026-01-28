'use client'

import { useEffect, useState } from 'react'
import { Wrench, CheckCircle, Clock, PlayCircle, MessageSquare, ExternalLink } from 'lucide-react'
import { Card, Button, Modal } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Ticket as TicketType, Category, Profile } from '@/types'
import Link from 'next/link'

type TicketWithRelations = TicketType & { reporter?: Profile; category?: Category | null }

export default function TeknisiDashboard() {
    const [tickets, setTickets] = useState<TicketWithRelations[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active')
    const [updatingTicket, setUpdatingTicket] = useState<string | null>(null)
    const [selectedTicket, setSelectedTicket] = useState<TicketWithRelations | null>(null)
    const [comment, setComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // Load categories
            const { data: cats } = await supabase.from('categories').select('*')
            if (cats) setCategories(cats)

            // Load assigned tickets
            const { data: ticketsData } = await supabase
                .from('tickets')
                .select(`
                    *,
                    reporter:profiles!tickets_reporter_id_fkey(*),
                    category:categories(*)
                `)
                .eq('assignee_id', session.user.id)
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

    const updateTicketStatus = async (ticketId: string, newStatus: 'in_progress' | 'resolved' | 'closed') => {
        setUpdatingTicket(ticketId)
        try {
            const updateData: any = { status: newStatus }
            if (newStatus === 'resolved' || newStatus === 'closed') {
                updateData.resolved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('tickets')
                .update(updateData)
                .eq('id', ticketId)

            if (!error) {
                loadData() // Refresh data
            }
        } catch (error) {
            console.error('Error updating ticket:', error)
        } finally {
            setUpdatingTicket(null)
        }
    }

    const addComment = async () => {
        if (!selectedTicket || !comment.trim()) return
        setIsSubmitting(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            await supabase
                .from('ticket_comments')
                .insert({
                    ticket_id: selectedTicket.id,
                    user_id: session.user.id,
                    content: comment,
                    is_internal: false,
                })

            setComment('')
            setSelectedTicket(null)
        } catch (error) {
            console.error('Error adding comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress')
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed')
    const displayedTickets = activeTab === 'active' ? activeTickets : resolvedTickets

    // Stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const resolvedToday = tickets.filter(t =>
        t.resolved_at && new Date(t.resolved_at) >= today
    ).length

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const resolvedThisWeek = tickets.filter(t =>
        t.resolved_at && new Date(t.resolved_at) >= weekAgo
    ).length

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge variant="danger">Urgent</Badge>
            case 'high': return <Badge variant="warning">High</Badge>
            case 'medium': return <Badge variant="primary">Medium</Badge>
            default: return <Badge variant="secondary">Low</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open': return <Badge variant="secondary">Buka</Badge>
            case 'in_progress': return <Badge variant="primary">Dikerjakan</Badge>
            case 'resolved': return <Badge variant="success">Selesai</Badge>
            case 'closed': return <Badge variant="secondary">Ditutup</Badge>
            default: return <Badge>{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2 lg:gap-3">
                    <Wrench className="w-6 h-6 lg:w-8 lg:h-8 text-indigo-600" />
                    Tiket Ditugaskan
                </h1>
                <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                    Daftar tiket yang ditugaskan kepada Anda
                </p>
            </div>

            {/* Stats - 2x2 on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-100 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Perlu Ditangani</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{activeTickets.length}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                            <PlayCircle className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Dikerjakan</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {tickets.filter(t => t.status === 'in_progress').length}
                            </p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Hari Ini</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{resolvedToday}</p>
                        </div>
                    </div>
                </Card>
                <Card padding="sm" className="lg:p-6">
                    <div className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4">
                        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
                        </div>
                        <div className="text-center lg:text-left">
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Minggu Ini</p>
                            <p className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">{resolvedThisWeek}</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('active')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'active'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Aktif ({activeTickets.length})
                </button>
                <button
                    onClick={() => setActiveTab('resolved')}
                    className={`px-4 py-2 font-medium transition-colors border-b-2 -mb-px ${activeTab === 'resolved'
                        ? 'text-indigo-600 border-indigo-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700'
                        }`}
                >
                    Selesai ({resolvedTickets.length})
                </button>
            </div>

            {/* Ticket List with Quick Actions */}
            <div className="space-y-4">
                {displayedTickets.length === 0 ? (
                    <Card padding="lg">
                        <div className="text-center py-8">
                            <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {activeTab === 'active' ? 'Tidak ada tiket aktif' : 'Belum ada tiket yang diselesaikan'}
                            </p>
                        </div>
                    </Card>
                ) : (
                    displayedTickets.map((ticket) => (
                        <Card key={ticket.id} padding="sm" className="lg:p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col gap-3 lg:gap-4">
                                <div className="flex items-start gap-3">
                                    <div
                                        className="w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full mt-1.5 lg:mt-2 shrink-0"
                                        style={{ backgroundColor: ticket.category?.color || '#6366f1' }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <Link
                                                href={`/dashboard/tickets/${ticket.id}`}
                                                className="text-base lg:text-lg font-semibold text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors block line-clamp-1"
                                            >
                                                {ticket.title}
                                            </Link>
                                            <div className="lg:hidden shrink-0">
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-xs lg:text-sm line-clamp-2 mt-0.5 lg:mt-1">
                                            {ticket.description}
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 mt-2 lg:mt-3">
                                            <div className="hidden lg:block">
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            {getPriorityBadge(ticket.priority)}
                                            {ticket.category && (
                                                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                    {ticket.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                            <span>
                                                Pelapor: {ticket.reporter?.full_name?.split(' ')[0] || 'Unknown'}
                                            </span>
                                            <span>•</span>
                                            <span>
                                                {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions - Mobile friendly */}
                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800 overflow-x-auto pb-1">
                                    {ticket.status === 'open' && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                                            isLoading={updatingTicket === ticket.id}
                                            className="flex-shrink-0"
                                        >
                                            <PlayCircle className="w-4 h-4 mr-1" />
                                            Kerjakan
                                        </Button>
                                    )}
                                    {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                                        <Button
                                            size="sm"
                                            variant="primary"
                                            onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                                            isLoading={updatingTicket === ticket.id}
                                            className="flex-shrink-0"
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" />
                                            Selesai
                                        </Button>
                                    )}
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setSelectedTicket(ticket)}
                                        className="shrink-0"
                                    >
                                        <MessageSquare className="w-4 h-4 mr-1" />
                                        Komen
                                    </Button>
                                    <Link href={`/dashboard/teknisi/ticket/${ticket.id}`} className="ml-auto">
                                        <Button size="sm" variant="ghost" className="shrink-0">
                                            Detail
                                            <ExternalLink className="w-4 h-4 ml-1" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Quick Comment Modal */}
            <Modal
                isOpen={!!selectedTicket}
                onClose={() => setSelectedTicket(null)}
                title={`Komentar: ${selectedTicket?.title}`}
                size="md"
            >
                <div className="space-y-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tulis komentar atau update..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        rows={4}
                    />
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedTicket(null)}
                            className="flex-1"
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={addComment}
                            isLoading={isSubmitting}
                            disabled={!comment.trim()}
                            className="flex-1"
                        >
                            Kirim Komentar
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
