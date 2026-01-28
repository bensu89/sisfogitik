'use client'

import { useEffect, useState } from 'react'
import { User, Mail, Building, Save } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export default function SettingsPage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single()

            if (data) setProfile(data)
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!profile) return

        setIsSaving(true)
        setMessage(null)

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: profile.full_name,
                    phone: profile.phone,
                    department: profile.department,
                })
                .eq('id', profile.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil' })
            console.error('Error updating profile:', error)
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                    <User className="w-8 h-8 text-indigo-600" />
                    Pengaturan Profil
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Kelola informasi profil Anda
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Informasi Pribadi</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {message && (
                            <div className={`p-4 rounded-lg text-sm ${message.type === 'success'
                                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                }`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    value={profile.email}
                                    disabled
                                    className="pl-10 bg-gray-50 dark:bg-gray-800"
                                />
                            </div>
                            <p className="text-xs text-gray-500">Email tidak dapat diubah</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Nama Lengkap
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    value={profile.full_name}
                                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                                    className="pl-10"
                                    placeholder="Nama Lengkap"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Departemen / Divisi
                            </label>
                            <div className="relative">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                    value={profile.department || ''}
                                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                    className="pl-10"
                                    placeholder="Contoh: IT Support, HRD, Finance"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button type="submit" isLoading={isSaving} className="w-full sm:w-auto">
                                <Save className="w-4 h-4 mr-2" />
                                Simpan Perubahan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
