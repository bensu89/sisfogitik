'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (signInError) {
                setError(signInError.message === 'Invalid login credentials'
                    ? 'Email atau password salah'
                    : signInError.message
                )
                return
            }

            if (data.user) {
                router.push('/dashboard')
                router.refresh()
            }
        } catch {
            setError('Terjadi kesalahan. Silakan coba lagi.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-white text-center mb-2">Selamat Datang</h2>
            <p className="text-gray-400 text-center mb-8">Masuk ke akun Anda untuk melanjutkan</p>

            {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </div>

                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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

                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center gap-2 text-gray-400">
                        <input type="checkbox" className="rounded border-gray-600 bg-white/10 text-indigo-500 focus:ring-indigo-500" />
                        Ingat saya
                    </label>
                    <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                        Lupa password?
                    </Link>
                </div>

                <Button type="submit" className="w-full py-3" isLoading={isLoading}>
                    Masuk
                </Button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-gray-400">
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Daftar sekarang
                    </Link>
                </p>
            </div>
        </div>
    )
}
