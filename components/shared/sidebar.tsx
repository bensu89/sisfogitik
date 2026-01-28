'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Ticket,
    Users,
    Settings,
    PlusCircle,
    BarChart3,
    Wrench,
    FolderOpen
} from 'lucide-react'
import { Profile } from '@/types'

interface SidebarProps {
    user: Profile
    isCollapsed?: boolean
}

interface NavItem {
    title: string
    href: string
    icon: React.ReactNode
    roles: string[]
}

export function Sidebar({ user, isCollapsed = false }: SidebarProps) {
    const pathname = usePathname()

    const navItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: <LayoutDashboard className="w-5 h-5" />,
            roles: ['pelapor', 'admin', 'teknisi'],
        },
        {
            title: 'Buat Tiket',
            href: '/dashboard/pelapor/create',
            icon: <PlusCircle className="w-5 h-5" />,
            roles: ['pelapor', 'admin'],
        },
        {
            title: 'Tiket Saya',
            href: '/dashboard/pelapor',
            icon: <FolderOpen className="w-5 h-5" />,
            roles: ['pelapor'],
        },
        {
            title: 'Semua Tiket',
            href: '/dashboard/admin',
            icon: <Ticket className="w-5 h-5" />,
            roles: ['admin'],
        },
        {
            title: 'Tiket Ditugaskan',
            href: '/dashboard/teknisi',
            icon: <Wrench className="w-5 h-5" />,
            roles: ['teknisi'],
        },
        {
            title: 'Kelola User',
            href: '/dashboard/admin/users',
            icon: <Users className="w-5 h-5" />,
            roles: ['admin'],
        },
        {
            title: 'Laporan',
            href: '/dashboard/admin/reports',
            icon: <BarChart3 className="w-5 h-5" />,
            roles: ['admin'],
        },
        {
            title: 'Pengaturan',
            href: '/dashboard/settings',
            icon: <Settings className="w-5 h-5" />,
            roles: ['pelapor', 'admin', 'teknisi'],
        },
    ]

    const filteredItems = navItems.filter(item => item.roles.includes(user.role))

    const roleLabels: Record<string, string> = {
        pelapor: 'Pelapor',
        admin: 'Administrator',
        teknisi: 'Teknisi',
    }

    return (
        <aside
            className={`
        fixed left-0 top-0 z-40 h-screen
        bg-gradient-to-b from-gray-900 to-gray-950
        border-r border-gray-800
        transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-gray-800">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                        <Ticket className="w-6 h-6 text-white" />
                    </div>
                    {!isCollapsed && (
                        <span className="text-xl font-bold text-white">SIGIK</span>
                    )}
                </Link>
            </div>

            {/* User Info */}
            <div className={`p-4 border-b border-gray-800 ${isCollapsed ? 'text-center' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium shrink-0">
                        {user.full_name.charAt(0).toUpperCase()}
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-white font-medium truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-400">{roleLabels[user.role]}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-2">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
                            title={isCollapsed ? item.title : undefined}
                        >
                            {item.icon}
                            {!isCollapsed && <span>{item.title}</span>}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}