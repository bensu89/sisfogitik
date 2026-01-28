'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/shared/sidebar'
import { Navbar } from '@/components/shared/navbar'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/types'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [user, setUser] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push('/login')
                    return
                }

                // Get user profile
                let { data: profile, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                // If profile doesn't exist, create it
                if (error || !profile) {
                    const userData = session.user.user_metadata
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .upsert({
                            id: session.user.id,
                            email: session.user.email || '',
                            full_name: userData?.full_name || session.user.email?.split('@')[0] || 'User',
                            role: userData?.role || 'pelapor',
                            department: userData?.department || null,
                        }, { onConflict: 'id' })
                        .select()
                        .single()

                    if (createError || !newProfile) {
                        // Try to fetch again - maybe it was created by another process
                        const { data: retryProfile } = await supabase
                            .from('profiles')
                            .select('*')
                            .eq('id', session.user.id)
                            .single()

                        if (retryProfile) {
                            profile = retryProfile
                        } else {
                            // Create a minimal profile object to proceed
                            profile = {
                                id: session.user.id,
                                email: session.user.email || '',
                                full_name: userData?.full_name || session.user.email?.split('@')[0] || 'User',
                                role: userData?.role || 'pelapor',
                                department: userData?.department || null,
                                avatar_url: null,
                                phone: null,
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            }
                        }
                    } else {
                        profile = newProfile
                    }
                }

                setUser(profile)
            } catch (error) {
                console.error('Auth check error:', error)
                router.push('/login')
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()

        // Subscribe to auth changes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
            if (event === 'SIGNED_OUT' || !session) {
                router.push('/login')
            }
        })

        return () => subscription.unsubscribe()
    }, [router])

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-gray-500 dark:text-gray-400">Memuat...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <Sidebar user={user} isCollapsed={sidebarCollapsed} />
            <Navbar user={user} onMenuClick={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <main className={`pt-16 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
