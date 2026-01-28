'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, Eye, EyeOff, Building } from 'lucide-react'
import { Button, Select } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'pelapor',
        department: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Role is always 'pelapor' for public registration
    // Teknisi and Admin are created by Admin via /dashboard/admin/users

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak cocok')
            return
        }

        if (formData.password.length < 6) {
            setError('Password minimal 6 karakter')
            return
        }

        setIsLoading(true)

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.fullName,
                        role: formData.role,
                        department: formData.department,
                    },
                },
            })

            if (signUpError) {
                if (signUpError.message.includes('already registered')) {
                    setError('Email sudah terdaftar')
                } else {
                    setError(signUpError.message)
                }
                return
            }

            if (data.user) {
                // Manually create profile since trigger might not work
                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert({
                        id: data.user.id,
                        email: formData.email,
                        full_name: formData.fullName,
                        role: formData.role,
                        department: formData.department || null,
                    })

                if (profileError) {
                    console.error('Profile creation error:', profileError)
                    // Continue anyway - user can still login
                }

                setSuccess(true)
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Registrasi Berhasil!</h2>
                <p className="text-gray-400 mb-6">
                    Silakan cek email Anda untuk verifikasi akun.
                </p>
                <Button onClick={() => router.push('/login')} className="w-full">
                    Kembali ke Login
                </Button>
            </div>
        )
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Buat Akun Baru</h2>
            <p className="text-gray-400 text-center mb-8">Daftar untuk mulai menggunakan SIGIK</p>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Nama Lengkap"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Departemen (opsional)"
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                </div>



                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Konfirmasi Password"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <Button type="submit" className="w-full py-3 mt-6" isLoading={isLoading}>
                    Daftar
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-400">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Masuk di sini
                    </Link>
                </p>
            </div>
        </div>
    )
}
