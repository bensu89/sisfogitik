'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Send } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import { TicketForm, TicketFormData } from '@/components/tickets'
import { supabase } from '@/lib/supabase'
import { Category } from '@/types'

export default function CreateTicketPage() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isLoadingCategories, setIsLoadingCategories] = useState(true)

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const { data } = await supabase.from('categories').select('*')
                if (data) setCategories(data)
            } catch (error) {
                console.error('Error loading categories:', error)
            } finally {
                setIsLoadingCategories(false)
            }
        }

        loadCategories()
    }, [])

    const handleSubmit = async (data: TicketFormData) => {
        setIsLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/login')
                return
            }

            const { data: ticket, error } = await supabase
                .from('tickets')
                .insert({
                    title: data.title,
                    description: data.description,
                    priority: data.priority,
                    category_id: data.category_id,
                    reporter_id: session.user.id,
                    status: 'open',
                })
                .select()
                .single()

            if (error) {
                console.error('Error creating ticket:', error)
                alert('Gagal membuat tiket. Silakan coba lagi.')
                return
            }

            if (ticket) {
                router.push(`/dashboard/tickets/${ticket.id}`)
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoadingCategories) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <Send className="w-8 h-8 text-indigo-600" />
                    Buat Tiket Baru
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Laporkan masalah atau keluhan IT Anda
                </p>
            </div>

            {/* Form Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Detail Laporan</CardTitle>
                </CardHeader>
                <CardContent>
                    <TicketForm
                        categories={categories}
                        onSubmit={handleSubmit}
                        isLoading={isLoading}
                    />
                </CardContent>
            </Card>

            {/* Tips */}
            <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl">
                <h3 className="font-medium text-indigo-900 dark:text-indigo-300 mb-2">💡 Tips</h3>
                <ul className="text-sm text-indigo-700 dark:text-indigo-400 space-y-1">
                    <li>• Jelaskan masalah dengan detail agar teknisi dapat membantu lebih cepat</li>
                    <li>• Sertakan langkah-langkah yang sudah Anda coba</li>
                    <li>• Pilih prioritas yang sesuai dengan tingkat urgensi</li>
                </ul>
            </div>
        </div>
    )
}
