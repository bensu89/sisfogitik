'use client'

import { useState } from 'react'
import { Clock, User, Tag, MessageCircle, Send, Image as ImageIcon, Camera, X, ZoomIn } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal } from '@/components/ui'
import { StatusBadge, PriorityBadge } from '@/components/ui/badge'
import { TicketWithRelations, Profile } from '@/types'

interface TicketDetailProps {
    ticket: TicketWithRelations
    currentUser: Profile
    onAddComment: (content: string, isInternal: boolean) => Promise<void>
    onUpdateStatus?: (status: string) => Promise<void>
}

export function TicketDetail({
    ticket,
    currentUser,
    onAddComment,
    onUpdateStatus
}: TicketDetailProps) {
    const [comment, setComment] = useState('')
    const [isInternal, setIsInternal] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showPhotoModal, setShowPhotoModal] = useState(false)

    const canSeeInternalComments = currentUser.role === 'admin' || currentUser.role === 'teknisi'
    const canUpdateStatus = currentUser.role === 'admin' || currentUser.id === ticket.assignee_id

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!comment.trim()) return

        setIsSubmitting(true)
        try {
            await onAddComment(comment, isInternal)
            setComment('')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    return (
        <div className="space-y-4 lg:space-y-6">
            {/* Ticket Header */}
            <Card padding="sm" className="lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3 lg:gap-4">
                    <div className="flex-1">
                        <h1 className="text-lg lg:text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {ticket.title}
                        </h1>
                        <p className="mt-2 text-sm lg:text-base text-gray-600 dark:text-gray-400">
                            {ticket.description}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end">
                        <StatusBadge status={ticket.status} />
                        <PriorityBadge priority={ticket.priority} />
                    </div>
                </div>

                <div className="mt-4 lg:mt-6 pt-4 lg:pt-6 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Dibuat
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatDate(ticket.created_at)}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Pelapor
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            <User className="w-4 h-4 inline mr-1" />
                            {ticket.reporter.full_name}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Ditugaskan ke
                        </label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                            <User className="w-4 h-4 inline mr-1" />
                            {ticket.assignee?.full_name || 'Belum ditugaskan'}
                        </p>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Kategori
                        </label>
                        <p className="mt-1 text-sm">
                            {ticket.category && (
                                <span
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium"
                                    style={{
                                        backgroundColor: `${ticket.category.color}20`,
                                        color: ticket.category.color
                                    }}
                                >
                                    <Tag className="w-3 h-3" />
                                    {ticket.category.name}
                                </span>
                            )}
                        </p>
                    </div>
                </div>

                {/* Status Update (Admin/Teknisi only) */}
                {canUpdateStatus && onUpdateStatus && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Update Status
                        </label>
                        <div className="mt-2 flex gap-2">
                            {['open', 'in_progress', 'resolved', 'closed'].map((status) => (
                                <Button
                                    key={status}
                                    variant={ticket.status === status ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => onUpdateStatus(status)}
                                >
                                    <StatusBadge status={status} />
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Photo Attachment Section */}
                {ticket.attachment_url && (
                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2 mb-3">
                            <Camera className="w-4 h-4" />
                            Foto dari Teknisi
                        </label>
                        <div
                            className="relative group w-32 h-32 cursor-pointer"
                            onClick={() => setShowPhotoModal(true)}
                        >
                            <img
                                src={ticket.attachment_url}
                                alt="Foto dokumentasi"
                                className="w-32 h-32 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-colors flex items-center justify-center">
                                <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Klik gambar untuk memperbesar
                        </p>
                    </div>
                )}
            </Card>

            {/* Photo Lightbox Modal */}
            {ticket.attachment_url && (
                <Modal
                    isOpen={showPhotoModal}
                    onClose={() => setShowPhotoModal(false)}
                    title="Foto Dokumentasi"
                    size="lg"
                >
                    <div className="flex flex-col items-center">
                        <img
                            src={ticket.attachment_url}
                            alt="Foto dokumentasi"
                            className="max-w-full max-h-[70vh] object-contain rounded-xl"
                        />
                        <div className="mt-4 flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowPhotoModal(false)}
                            >
                                Tutup
                            </Button>
                            <Button
                                onClick={() => ticket.attachment_url && window.open(ticket.attachment_url, '_blank')}
                            >
                                Buka di Tab Baru
                            </Button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Comments Section */}
            <Card padding="none">
                <CardHeader className="p-6">
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Komentar ({ticket.comments.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {/* Comments List */}
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {ticket.comments.length === 0 ? (
                            <p className="p-6 text-center text-gray-500 dark:text-gray-400">
                                Belum ada komentar
                            </p>
                        ) : (
                            ticket.comments.map((c) => (
                                <div
                                    key={c.id}
                                    className={`p-6 ${c.is_internal ? 'bg-amber-50 dark:bg-amber-900/20' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium">
                                            {c.user.full_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                                    {c.user.full_name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatDate(c.created_at)}
                                                </span>
                                                {c.is_internal && (
                                                    <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-300 px-2 py-0.5 rounded">
                                                        Internal
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                                {c.content}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Comment Form */}
                    <form onSubmit={handleSubmitComment} className="p-6 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                                {currentUser.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 space-y-3">
                                <Input
                                    placeholder="Tulis komentar..."
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <div className="flex items-center justify-between">
                                    {canSeeInternalComments && (
                                        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <input
                                                type="checkbox"
                                                checked={isInternal}
                                                onChange={(e) => setIsInternal(e.target.checked)}
                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            Catatan internal (tidak terlihat oleh pelapor)
                                        </label>
                                    )}
                                    <Button type="submit" size="sm" isLoading={isSubmitting} className="ml-auto">
                                        <Send className="w-4 h-4 mr-1" />
                                        Kirim
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
