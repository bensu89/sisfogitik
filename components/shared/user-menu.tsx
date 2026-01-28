'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface UserMenuProps {
    user: Profile
}

export function UserMenu({ user }: UserMenuProps) {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const menuRef = useRef<HTMLDivElement>(null)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const roleLabels: Record<string, string> = {
        pelapor: 'Pelapor',
        admin: 'Administrator',
        teknisi: 'Teknisi',
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium">
                    {user.full_name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {user.full_name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {roleLabels[user.role]}
                    </p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {/* User Info Header */}
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white text-lg font-medium">
                                {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-white font-medium">{user.full_name}</p>
                                <p className="text-white/70 text-sm">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="p-2">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="w-5 h-5" />
                            <span>Profil Saya</span>
                        </Link>

                        <Link
                            href="/dashboard/settings"
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <Settings className="w-5 h-5" />
                            <span>Pengaturan</span>
                        </Link>

                        <div className="border-t border-gray-100 dark:border-gray-800 my-2" />

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Keluar</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
