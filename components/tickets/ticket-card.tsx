'use client'

import Link from 'next/link'
import { Clock, User, Tag } from 'lucide-react'
import { Card } from '@/components/ui'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { Ticket, Profile, Category } from '@/types'

interface TicketCardProps {
    ticket: Ticket & {
        reporter?: Profile
        assignee?: Profile | null
        category?: Category | null
    }
    href?: string
}

export function TicketCard({ ticket, href }: TicketCardProps) {
    const formattedDate = new Date(ticket.created_at).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

    const content = (
        <Card hover variant="bordered" padding="sm" className="group cursor-pointer lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate text-sm lg:text-base">
                            {ticket.title}
                        </h3>
                        <div className="lg:hidden shrink-0">
                            <StatusBadge status={ticket.status} />
                        </div>
                    </div>
                    <p className="mt-1 text-xs lg:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {ticket.description}
                    </p>
                </div>
                <div className="hidden lg:flex flex-col items-end gap-2">
                    <StatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                </div>
            </div>

            <div className="mt-3 lg:mt-4 pt-3 lg:pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center gap-3 lg:gap-4 text-xs lg:text-sm text-gray-500 dark:text-gray-400">
                <div className="lg:hidden">
                    <PriorityBadge priority={ticket.priority} />
                </div>
                <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    <span>{formattedDate}</span>
                </div>

                {ticket.reporter && (
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{ticket.reporter.full_name}</span>
                    </div>
                )}

                {ticket.category && (
                    <div className="flex items-center gap-1.5">
                        <Tag className="w-4 h-4" />
                        <span
                            className="px-2 py-0.5 rounded text-xs font-medium"
                            style={{
                                backgroundColor: `${ticket.category.color}20`,
                                color: ticket.category.color
                            }}
                        >
                            {ticket.category.name}
                        </span>
                    </div>
                )}
            </div>
        </Card>
    )

    if (href) {
        return <Link href={href}>{content}</Link>
    }

    return content
}
