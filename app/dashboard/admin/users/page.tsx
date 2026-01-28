'use client'

import { useEffect, useState } from 'react'
import { Users, UserPlus, Mail, Lock, User, Building, Trash2 } from 'lucide-react'
import { Button, Card, CardHeader, CardTitle, CardContent, Input, Select, Modal } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Profile } from '@/types'

export default function AdminUsersPage() {
    const [users, setUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        role: 'teknisi',
        department: '',
    })

    const roleOptions = [
        { value: 'pelapor', label: 'Pelapor' },
        { value: 'teknisi', label: 'Teknisi' },
        { value: 'admin', label: 'Administrator' },
    ]

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            const res = await fetch('/api/users')
            const data = await res.json()
            if (data.users) {
                setUsers(data.users)
            }
        } catch (err) {
            console.error('Error loading users:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setSuccess('')
        setIsCreating(true)

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to create user')
                return
            }

            setSuccess(`User ${formData.email} created successfully!`)
            setFormData({ email: '', password: '', fullName: '', role: 'teknisi', department: '' })
            setShowCreateModal(false)
            loadUsers()
        } catch (err) {
            setError('Failed to create user')
        } finally {
            setIsCreating(false)
        }
    }

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            case 'teknisi': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
        }
    }

    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin': return 'Administrator'
            case 'teknisi': return 'Teknisi'
            default: return 'Pelapor'
        }
    }

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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-600" />
                        Kelola Pengguna
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Buat dan kelola akun pengguna sistem
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <UserPlus className="w-5 h-5 mr-2" />
                    Buat Pengguna Baru
                </Button>
            </div>

            {/* Success message */}
            {success && (
                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-700 dark:text-emerald-400">
                    {success}
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Pengguna</p>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-purple-600">{users.filter(u => u.role === 'admin').length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Administrator</p>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-blue-600">{users.filter(u => u.role === 'teknisi').length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Teknisi</p>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <p className="text-3xl font-bold text-gray-600">{users.filter(u => u.role === 'pelapor').length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Pelapor</p>
                    </div>
                </Card>
            </div>

            {/* Users List */}
            <Card>
                <CardHeader>
                    <CardTitle>Daftar Pengguna</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Nama</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Departemen</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">Terdaftar</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                                                        {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                                <span className="font-medium text-gray-900 dark:text-gray-100">{user.full_name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{user.department || '-'}</td>
                                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                            {new Date(user.created_at).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Create User Modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Buat Pengguna Baru" size="md">
                <form onSubmit={handleCreateUser} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <Input
                        label="Nama Lengkap"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                    />

                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        helperText="Minimal 6 karakter"
                        required
                    />

                    <Select
                        label="Role"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        options={roleOptions}
                    />

                    <Input
                        label="Departemen (opsional)"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
                            Batal
                        </Button>
                        <Button type="submit" isLoading={isCreating} className="flex-1">
                            Buat Pengguna
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
