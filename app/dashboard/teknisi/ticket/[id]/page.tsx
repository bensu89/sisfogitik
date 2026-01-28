'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
    ArrowLeft, Camera, CheckCircle, Clock, PlayCircle,
    Send, X, Image as ImageIcon, Loader2, AlertCircle
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase'
import { Ticket, Category, Profile } from '@/types'
import Link from 'next/link'

type TicketWithRelations = Ticket & {
    reporter?: Profile;
    category?: Category | null;
    assignee?: Profile | null;
}

export default function TeknisiTicketAction() {
    const params = useParams()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [ticket, setTicket] = useState<TicketWithRelations | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [comment, setComment] = useState('')
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadProgress, setUploadProgress] = useState(0)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    useEffect(() => {
        loadTicket()
    }, [params.id])

    const loadTicket = async () => {
        try {
            const { data, error } = await supabase
                .from('tickets')
                .select(`
                    *,
                    reporter:profiles!tickets_reporter_id_fkey(*),
                    assignee:profiles!tickets_assignee_id_fkey(*),
                    category:categories(*)
                `)
                .eq('id', params.id)
                .single()

            if (error) throw error
            setTicket(data)
        } catch (err) {
            console.error('Error loading ticket:', err)
            setError('Gagal memuat tiket')
        } finally {
            setIsLoading(false)
        }
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = () => {
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const updateTicketStatus = async (newStatus: 'in_progress' | 'resolved' | 'closed', withPhoto = false) => {
        if (!ticket) return
        setIsUpdating(true)
        setError('')
        setSuccess('')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) throw new Error('Not authenticated')

            let photoUrl = null

            // Upload photo if provided
            if (withPhoto && selectedImage) {
                setUploadProgress(10)
                const fileExt = selectedImage.name.split('.').pop()
                const fileName = `${ticket.id}/${Date.now()}.${fileExt}`

                setUploadProgress(30)
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('ticket-photos')
                    .upload(fileName, selectedImage, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    throw new Error(`Gagal upload foto: ${uploadError.message}`)
                }

                setUploadProgress(70)
                const { data: urlData } = supabase.storage
                    .from('ticket-photos')
                    .getPublicUrl(fileName)

                photoUrl = urlData.publicUrl
                setUploadProgress(90)
            }

            // Update ticket status
            const updateData: any = {
                status: newStatus,
                updated_at: new Date().toISOString()
            }
            if (newStatus === 'resolved' || newStatus === 'closed') {
                updateData.resolved_at = new Date().toISOString()
            }
            if (photoUrl) {
                updateData.attachment_url = photoUrl
            }

            const { error: updateError } = await supabase
                .from('tickets')
                .update(updateData)
                .eq('id', ticket.id)

            if (updateError) throw updateError

            // Add comment if provided
            if (comment.trim()) {
                await supabase
                    .from('ticket_comments')
                    .insert({
                        ticket_id: ticket.id,
                        user_id: session.user.id,
                        content: comment + (photoUrl ? `\n\n📷 Foto terlampir: ${photoUrl}` : ''),
                        is_internal: false,
                    })
            }

            setUploadProgress(100)
            setSuccess(`Tiket berhasil diupdate ke status: ${getStatusLabel(newStatus)}`)

            // Reset form
            setComment('')
            removeImage()

            // Reload ticket
            await loadTicket()

        } catch (err: any) {
            console.error('Error updating ticket:', err)
            setError(err.message || 'Gagal mengupdate tiket')
        } finally {
            setIsUpdating(false)
            setUploadProgress(0)
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Buka'
            case 'in_progress': return 'Dikerjakan'
            case 'resolved': return 'Selesai'
            case 'closed': return 'Ditutup'
            default: return status
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'open':
                return <Badge variant="secondary" className="text-lg px-4 py-2">🟡 Buka</Badge>
            case 'in_progress':
                return <Badge variant="primary" className="text-lg px-4 py-2">🔵 Dikerjakan</Badge>
            case 'resolved':
                return <Badge variant="success" className="text-lg px-4 py-2">🟢 Selesai</Badge>
            case 'closed':
                return <Badge variant="secondary" className="text-lg px-4 py-2">⚫ Ditutup</Badge>
            default:
                return <Badge className="text-lg px-4 py-2">{status}</Badge>
        }
    }

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'urgent': return <Badge variant="danger" className="text-base px-3 py-1">🔴 Urgent</Badge>
            case 'high': return <Badge variant="warning" className="text-base px-3 py-1">🟠 High</Badge>
            case 'medium': return <Badge variant="primary" className="text-base px-3 py-1">🔵 Medium</Badge>
            default: return <Badge variant="secondary" className="text-base px-3 py-1">⚪ Low</Badge>
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
        )
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
                <Card padding="lg" className="text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Tiket Tidak Ditemukan</h2>
                    <Link href="/dashboard/teknisi">
                        <Button>Kembali</Button>
                    </Link>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-32">
            {/* Header - Fixed */}
            <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard/teknisi">
                        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-lg font-bold truncate">{ticket.title}</h1>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(ticket.status)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {/* Alerts */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 shrink-0" />
                        {success}
                    </div>
                )}

                {/* Ticket Info Card */}
                <Card padding="lg" className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div
                            className="w-4 h-4 rounded-full shrink-0 mt-1"
                            style={{ backgroundColor: ticket.category?.color || '#6366f1' }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-600 dark:text-gray-400 text-base leading-relaxed">
                                {ticket.description}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {getPriorityBadge(ticket.priority)}
                        {ticket.category && (
                            <Badge variant="outline" className="text-base px-3 py-1">
                                📁 {ticket.category.name}
                            </Badge>
                        )}
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Pelapor</p>
                            <p className="font-medium">{ticket.reporter?.full_name || 'Unknown'}</p>
                        </div>
                        <div>
                            <p className="text-gray-500 dark:text-gray-400">Tanggal</p>
                            <p className="font-medium">
                                {new Date(ticket.created_at).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>

                    {ticket.attachment_url && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">Foto Terlampir</p>
                            <img
                                src={ticket.attachment_url}
                                alt="Attachment"
                                className="w-full max-h-64 object-cover rounded-xl"
                            />
                        </div>
                    )}
                </Card>

                {/* Photo Upload */}
                <Card padding="lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Dokumentasi Foto
                    </h3>

                    {imagePreview ? (
                        <div className="relative">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full max-h-80 object-cover rounded-2xl"
                            />
                            <button
                                onClick={removeImage}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        <label className="block">
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-all active:scale-95">
                                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                    Tap untuk Ambil Foto
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Kamera akan terbuka otomatis
                                </p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </label>
                    )}
                </Card>

                {/* Comment */}
                <Card padding="lg">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Send className="w-5 h-5" />
                        Catatan / Komentar
                    </h3>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tulis catatan pekerjaan yang dilakukan..."
                        className="w-full px-4 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-base"
                        rows={4}
                    />
                </Card>

                {/* Upload Progress */}
                {isUpdating && uploadProgress > 0 && (
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4">
                        <div className="flex items-center gap-3 mb-2">
                            <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                            <span className="text-indigo-700 dark:text-indigo-400">
                                {uploadProgress < 100 ? 'Mengupload...' : 'Selesai!'}
                            </span>
                        </div>
                        <div className="h-2 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-indigo-600 transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Fixed Bottom Action Buttons */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 space-y-3">
                {ticket.status === 'open' && (
                    <Button
                        size="lg"
                        variant="outline"
                        className="w-full h-14 text-lg font-semibold"
                        onClick={() => updateTicketStatus('in_progress')}
                        isLoading={isUpdating}
                    >
                        <PlayCircle className="w-6 h-6 mr-2" />
                        Mulai Kerjakan
                    </Button>
                )}

                {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
                        onClick={() => updateTicketStatus('resolved', !!selectedImage)}
                        isLoading={isUpdating}
                    >
                        <CheckCircle className="w-6 h-6 mr-2" />
                        {selectedImage ? 'Selesai & Upload Foto' : 'Tandai Selesai'}
                    </Button>
                )}

                {ticket.status === 'resolved' && (
                    <div className="text-center py-4">
                        <div className="text-5xl mb-2">✅</div>
                        <p className="text-lg font-semibold text-emerald-600">Tiket Sudah Selesai</p>
                    </div>
                )}
            </div>
        </div>
    )
}
