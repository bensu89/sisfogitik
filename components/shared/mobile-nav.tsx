'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    PlusCircle,
    Ticket,
    Wrench,
    User,
    Users,
    BarChart3
} from 'lucide-react'
import { Profile } from '@/types'

interface MobileNavProps {
    user: Profile
}

export function MobileNav({ user }: MobileNavProps) {
    const pathname = usePathname()

    // Define nav items based on role
    const getNavItems = () => {
        const baseItems = [
            {
                title: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            }
        ]

        if (user.role === 'pelapor') {
            return [
                ...baseItems,
                {
                    title: 'Buat',
                    href: '/dashboard/pelapor/create',
                    icon: PlusCircle,
                },
                {
                    title: 'Tiket',
                    href: '/dashboard/pelapor',
                    icon: Ticket,
                },
                {
                    title: 'Profil',
                    href: '/dashboard/settings',
                    icon: User,
                }
            ]
        }

        if (user.role === 'teknisi') {
            return [
                ...baseItems,
                {
                    title: 'Tugas',
                    href: '/dashboard/teknisi',
                    icon: Wrench,
                },
                {
                    title: 'Profil',
                    href: '/dashboard/settings',
                    icon: User,
                }
            ]
        }

        if (user.role === 'admin') {
            return [
                ...baseItems,
                {
                    title: 'Buat',
                    href: '/dashboard/pelapor/create',
                    icon: PlusCircle,
                },
                {
                    title: 'Tiket',
                    href: '/dashboard/admin',
                    icon: Ticket,
                },
                {
                    title: 'Users',
                    href: '/dashboard/admin/users',
                    icon: Users,
                },
                {
                    title: 'Laporan',
                    href: '/dashboard/admin/reports',
                    icon: BarChart3,
                },
                {
                    title: 'Profil',
                    href: '/dashboard/settings',
                    icon: User,
                }
            ]
        }

        return baseItems
    }

    const navItems = getNavItems()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center flex-1 h-full px-2 py-1
                                transition-colors duration-200 rounded-lg mx-0.5
                                ${isActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
                                }
                            `}
                        >
                            <div className={`
                                p-1.5 rounded-xl transition-all duration-200
                                ${isActive ? 'bg-indigo-100 dark:bg-indigo-900/30' : ''}
                            `}>
                                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                            </div>
                            <span className={`text-[10px] mt-0.5 font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                                {item.title}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
