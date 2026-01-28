import { ReactNode } from 'react'
import { Ticket } from 'lucide-react'

export default function AuthLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    backgroundImage: 'url("/images/bg-campus.jpg")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />

            {/* Overlay - Gradient Blue/Yellow tint to match branding */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900/80 via-indigo-900/80 to-yellow-900/30 backdrop-blur-[2px]" />

            {/* Content */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                {/* Logos */}
                <div className="flex items-center gap-6 mb-8 animate-fade-in-down">
                    <img
                        src="/images/logo-unsap.png"
                        alt="Logo UNSAP"
                        className="h-16 md:h-20 w-auto drop-shadow-lg"
                    />
                    <div className="h-12 w-px bg-white/30 hidden md:block" />
                    <img
                        src="/images/logo-diktisaintek.png"
                        alt="Logo Diktisaintek"
                        className="h-12 md:h-16 w-auto drop-shadow-lg"
                    />
                </div>

                {/* Main Container */}
                <div className="w-full flex flex-col md:flex-row shadow-2xl rounded-3xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20">

                    {/* Left Side - Welcome / Branding (Visible on Desktop) */}
                    <div className="hidden md:flex flex-1 p-12 bg-gradient-to-br from-blue-600/20 to-yellow-600/20 flex-col justify-center text-white relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-black/10" />
                        <div className="relative z-10">
                            <h2 className="text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-white">
                                SIGIK
                            </h2>
                            <h3 className="text-xl font-semibold mb-6">
                                Sistem Informasi Gangguan IT & Keluhan
                            </h3>
                            <p className="text-blue-100 leading-relaxed">
                                Universitas Sebelas April (UNSAP).
                                Layanan pelaporan gangguan teknis dan dukungan IT terintegrasi.
                            </p>

                            <div className="mt-12 flex gap-4">
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="text-yellow-400 font-bold text-lg">Fast</p>
                                    <p className="text-xs text-blue-100">Respon Cepat</p>
                                </div>
                                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                                    <p className="text-yellow-400 font-bold text-lg">Easy</p>
                                    <p className="text-xs text-blue-100">Mudah Digunakan</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form Container */}
                    <div className="flex-1 p-8 md:p-12 bg-white dark:bg-gray-900">
                        {children}
                    </div>
                </div>

                <p className="mt-8 text-white/50 text-sm">
                    &copy; {new Date().getFullYear()} Universitas Sebelas April. All rights reserved.
                </p>
            </div>
        </div>
    )
}
