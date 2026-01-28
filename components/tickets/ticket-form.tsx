'use client'

import { useState } from 'react'
import { Button, Input, Select } from '@/components/ui'
import { Category } from '@/types'

interface TicketFormProps {
    categories: Category[]
    onSubmit: (data: TicketFormData) => Promise<void>
    isLoading?: boolean
}

export interface TicketFormData {
    title: string
    description: string
    priority: 'low' | 'medium' | 'high' | 'urgent'
    category_id: string
}

export function TicketForm({ categories, onSubmit, isLoading }: TicketFormProps) {
    const [formData, setFormData] = useState<TicketFormData>({
        title: '',
        description: '',
        priority: 'medium',
        category_id: '',
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    const priorityOptions = [
        { value: 'low', label: 'Rendah' },
        { value: 'medium', label: 'Sedang' },
        { value: 'high', label: 'Tinggi' },
        { value: 'urgent', label: 'Urgent' },
    ]

    const categoryOptions = categories.map((cat) => ({
        value: cat.id,
        label: cat.name,
    }))

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.title.trim()) {
            newErrors.title = 'Judul tiket wajib diisi'
        }
        if (!formData.description.trim()) {
            newErrors.description = 'Deskripsi wajib diisi'
        }
        if (!formData.category_id) {
            newErrors.category_id = 'Pilih kategori'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!validate()) return
        await onSubmit(formData)
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <Input
                label="Judul Tiket"
                placeholder="Contoh: Printer tidak bisa print"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                required
            />

            <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Deskripsi
                </label>
                <textarea
                    className={`
            w-full px-4 py-2.5 rounded-lg border transition-all duration-200
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            min-h-[120px] resize-y
            ${errors.description
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }
          `}
                    placeholder="Jelaskan masalah yang Anda alami secara detail..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                />
                {errors.description && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.description}</p>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Select
                    label="Kategori"
                    options={categoryOptions}
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    placeholder="Pilih kategori..."
                    error={errors.category_id}
                    required
                />

                <Select
                    label="Prioritas"
                    options={priorityOptions}
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketFormData['priority'] })}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="secondary">
                    Batal
                </Button>
                <Button type="submit" isLoading={isLoading}>
                    Buat Tiket
                </Button>
            </div>
        </form>
    )
}
