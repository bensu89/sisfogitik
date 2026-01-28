'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, Bell, Search, LogOut, User, Settings, Moon, Sun } from 'lucide-react'
import { Button, Input } from '@/components/ui'
import { Profile } from '@/types'
import { supabase } from '@/lib/supabase'

interface NavbarProps {
    user: Profile
    onMenuClick?: () => void
}

export function Navbar({ user, onMenuClick }: NavbarProps) {
    const router = useRouter()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(false)

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode)
        document.documentElement.classList.toggle('dark')
    }

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 right-0 left-0 lg:left-64 z-30">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left Section */}
                <div className="flex items-center gap-3">
                    {/* Mobile Menu Button */}
                    <Button variant="ghost" size="sm" onClick={onMenuClick} className="p-2">
                        <Menu className="w-5 h-5" />
                    </Button>

                    {/* App Name on Mobile */}
                    <h1 className="text-lg font-bold text-indigo-600 dark:text-indigo-400 lg:hidden">
                        SIGIK
                    </h1>


                </div>

                {/* Right Section */}
                <div className="flex items-center gap-1 lg:gap-2">
                    {/* Dark Mode Toggle */}
                    <Button variant="ghost" size="sm" onClick={toggleDarkMode} className="p-2">
                        {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </Button>

                    {/* Notifications */}
                    <Button variant="ghost" size="sm" className="relative p-2">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </Button>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.full_name.charAt(0).toUpperCase()}
                            </div>
                            <div className="hidden lg:block text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 max-w-24 truncate">
                                    {user.full_name}
                                </p>
                            </div>
                        </button>

                        {/* Dropdown */}
                        {showUserMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowUserMenu(false)}
                                />
                                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {user.full_name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </p>
                                    </div>

                                    <Link
                                        href="/dashboard/profile"
                                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <User className="w-4 h-4" />
                                        <span>Profil Saya</span>
                                    </Link>

                                    <Link
                                        href="/dashboard/settings"
                                        className="flex items-center gap-3 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Pengaturan</span>
                                    </Link>

                                    <div className="border-t border-gray-100 dark:border-gray-800 mt-2 pt-2">
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            <span>Keluar</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}