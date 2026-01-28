'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui'
import { TicketDetail } from '@/components/tickets'
import { supabase } from '@/lib/supabase'
import { TicketWithRelations, Profile } from '@/types'

export default function TicketDetailPage() {
    const router = useRouter()
    const params = useParams()
    const ticketId = params.id as string

    const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
    const [currentUser, setCurrentUser] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    router.push('/login')
                    return
                }

                // Get current user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (profile) {
                    setCurrentUser(profile)
                }

                // Get ticket with relations
                const { data, error: ticketError } = await supabase
                    .from('tickets')
                    .select(`
            *,
            reporter:profiles!tickets_reporter_id_fkey(*),
            assignee:profiles!tickets_assignee_id_fkey(*),
            category:categories(*),
            comments:ticket_comments(
              *,
              user:profiles(*)
            )
          `)
                    .eq('id', ticketId)
                    .single()

                if (ticketError) {
                    setError('Tiket tidak ditemukan')
                    return
                }

                // Sort comments by date
                if (data.comments) {
                    data.comments.sort((a: { created_at: string }, b: { created_at: string }) =>
                        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
                    )
                }

                setTicket(data as TicketWithRelations)
            } catch (err) {
                console.error('Error loading ticket:', err)
                setError('Terjadi kesalahan saat memuat tiket')
            } finally {
                setIsLoading(false)
            }
        }

        loadData()
    }, [ticketId, router])

    const handleAddComment = async (content: string, isInternal: boolean) => {
        if (!currentUser || !ticket) return

        try {
            const { data, error } = await supabase
                .from('ticket_comments')
                .insert({
                    ticket_id: ticket.id,
                    user_id: currentUser.id,
                    content,
                    is_internal: isInternal,
                })
                .select(`
          *,
          user:profiles(*)
        `)
                .single()

            if (error) throw error

            // Add comment to local state
            setTicket({
                ...ticket,
                comments: [...ticket.comments, data],
            })
        } catch (err) {
            console.error('Error adding comment:', err)
            alert('Gagal menambahkan komentar')
        }
    }

    const handleUpdateStatus = async (status: string) => {
        if (!ticket) return

        try {
            const updates: Record<string, unknown> = { status }
            if (status === 'resolved') {
                updates.resolved_at = new Date().toISOString()
            }

            const { error } = await supabase
                .from('tickets')
                .update(updates)
                .eq('id', ticket.id)

            if (error) throw error

            // Update local state
            setTicket({
                ...ticket,
                status: status as TicketWithRelations['status'],
                resolved_at: status === 'resolved' ? new Date().toISOString() : ticket.resolved_at,
            })
        } catch (err) {
            console.error('Error updating status:', err)
            alert('Gagal mengubah status')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (error || !ticket || !currentUser) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {error || 'Tiket tidak ditemukan'}
                </h2>
                <Button variant="outline" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Button variant="ghost" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Kembali
            </Button>

            <TicketDetail
                ticket={ticket}
                currentUser={currentUser}
                onAddComment={handleAddComment}
                onUpdateStatus={handleUpdateStatus}
            />
        </div>
    )
}
