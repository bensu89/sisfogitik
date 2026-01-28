'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Ticket,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    ArrowRight,
    PlusCircle
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Ticket as TicketType, Profile, DashboardStats } from '@/types'

export default function DashboardPage() {
    const [user, setUser] = useState<Profile | null>(null)
    const [stats, setStats] = useState<DashboardStats>({
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
    })
    const [recentTickets, setRecentTickets] = useState<TicketType[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                // Get user profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                if (profile) {
                    setUser(profile)
                }

                // Get tickets based on role
                let ticketsQuery = supabase.from('tickets').select('*')

                if (profile?.role === 'pelapor') {
                    ticketsQuery = ticketsQuery.eq('reporter_id', session.user.id)
                } else if (profile?.role === 'teknisi') {
                    ticketsQuery = ticketsQuery.eq('assignee_id', session.user.id)
                }
                // Admin gets all tickets

                const { data: tickets } = await ticketsQuery.order('created_at', { ascending: false })

                if (tickets) {
                    setStats({
                        totalTickets: tickets.length,
                        openTickets: tickets.filter((t: any) => t.status === 'open').length,
                        inProgressTickets: tickets.filter((t: any) => t.status === 'in_progress').length,
                        resolvedTickets: tickets.filter((t: any) => t.status === 'resolved' || t.status === 'closed').length,
                    })
                    setRecentTickets(tickets.slice(0, 5))
                }
            } catch (error) {
                console.error('Error loading dashboard:', error)
            } finally {
                setIsLoading(false)
            }
        }

        loadDashboard()
    }, [])

    const statCards = [
        {
            title: 'Total Tiket',
            value: stats.totalTickets,
            icon: Ticket,
            color: 'from-indigo-500 to-purple-500',
            bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
        },
        {
            title: 'Tiket Baru',
            value: stats.openTickets,
            icon: AlertCircle,
            color: 'from-blue-500 to-cyan-500',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
        },
        {
            title: 'Dalam Proses',
            value: stats.inProgressTickets,
            icon: Clock,
            color: 'from-amber-500 to-orange-500',
            bgColor: 'bg-amber-50 dark:bg-amber-900/20',
        },
        {
            title: 'Selesai',
            value: stats.resolvedTickets,
            icon: CheckCircle,
            color: 'from-emerald-500 to-teal-500',
            bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        },
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const roleLabels: Record<string, string> = {
        pelapor: 'Pelapor',
        admin: 'Administrator',
        teknisi: 'Teknisi',
    }

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Welcome Header */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Halo, {user?.full_name?.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-sm lg:text-base text-gray-500 dark:text-gray-400 mt-1">
                        Login sebagai <span className="font-medium text-indigo-600 dark:text-indigo-400">{roleLabels[user?.role || 'pelapor']}</span>
                    </p>
                </div>
                {(user?.role === 'pelapor' || user?.role === 'admin') && (
                    <Link href="/dashboard/pelapor/create" className="lg:hidden">
                        <Button className="w-full">
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Buat Tiket Baru
                        </Button>
                    </Link>
                )}
            </div>

            {/* Stats Grid - 2x2 on mobile */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                {statCards.map((stat, index) => (
                    <Card key={index} hover className="relative overflow-hidden" padding="sm">
                        <div className={`absolute top-0 right-0 w-20 h-20 lg:w-32 lg:h-32 -mr-6 -mt-6 lg:-mr-8 lg:-mt-8 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
                        <div className="relative">
                            <div className={`w-10 h-10 lg:w-12 lg:h-12 rounded-xl ${stat.bgColor} flex items-center justify-center mb-2 lg:mb-4`}>
                                <stat.icon className={`w-5 h-5 lg:w-6 lg:h-6 bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'transparent', backgroundClip: 'text', WebkitBackgroundClip: 'text' }} />
                            </div>
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                            <p className="text-xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mt-0.5 lg:mt-1">{stat.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Tickets */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Tiket Terbaru
                    </CardTitle>
                    <Link href={user?.role === 'admin' ? '/dashboard/admin' : user?.role === 'teknisi' ? '/dashboard/teknisi' : '/dashboard/pelapor'}>
                        <Button variant="ghost" size="sm">
                            Lihat Semua <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {recentTickets.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Ticket className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">Belum ada tiket</p>
                            {user?.role === 'pelapor' && (
                                <Link href="/dashboard/pelapor/create">
                                    <Button variant="outline" className="mt-4">
                                        <PlusCircle className="w-4 h-4 mr-2" />
                                        Buat Tiket Pertama
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {recentTickets.map((ticket) => (
                                <Link
                                    key={ticket.id}
                                    href={`/dashboard/tickets/${ticket.id}`}
                                    className="block py-3 lg:py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-4 lg:-mx-6 px-4 lg:px-6 transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm lg:text-base">
                                                {ticket.title}
                                            </h4>
                                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <StatusBadge status={ticket.status} />
                                    </div>
                                    <div className="mt-2 lg:hidden">
                                        <PriorityBadge priority={ticket.priority} />
                                    </div>
                                    <div className="hidden lg:flex items-center gap-3 mt-0">
                                        <PriorityBadge priority={ticket.priority} />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
