import { HTMLAttributes, ReactNode } from 'react'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'primary' | 'secondary' | 'outline'
type BadgeSize = 'sm' | 'md'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    children: ReactNode
    variant?: BadgeVariant
    size?: BadgeSize
    dot?: boolean
}

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    dot = false,
    className = '',
    ...props
}: BadgeProps) {
    const variants: Record<BadgeVariant, string> = {
        default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400',
        warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400',
        danger: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400',
        info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400',
        purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400',
        primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400',
        secondary: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
        outline: 'bg-transparent border border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-400',
    }

    const dotColors: Record<BadgeVariant, string> = {
        default: 'bg-gray-500',
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
        purple: 'bg-purple-500',
        primary: 'bg-indigo-500',
        secondary: 'bg-gray-400',
        outline: 'bg-gray-400',
    }

    const sizes: Record<BadgeSize, string> = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-xs',
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 font-medium rounded-full
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </span>
    )
}

// Preset badge variants for ticket status
export function StatusBadge({ status }: { status: string }) {
    const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        open: { variant: 'info', label: 'Buka' },
        in_progress: { variant: 'warning', label: 'Dalam Proses' },
        resolved: { variant: 'success', label: 'Selesai' },
        closed: { variant: 'default', label: 'Ditutup' },
    }

    const config = statusConfig[status] || { variant: 'default', label: status }

    return (
        <Badge variant={config.variant} dot>
            {config.label}
        </Badge>
    )
}

// Preset badge variants for ticket priority
export function PriorityBadge({ priority }: { priority: string }) {
    const priorityConfig: Record<string, { variant: BadgeVariant; label: string }> = {
        low: { variant: 'default', label: 'Rendah' },
        medium: { variant: 'info', label: 'Sedang' },
        high: { variant: 'warning', label: 'Tinggi' },
        urgent: { variant: 'danger', label: 'Urgent' },
    }

    const config = priorityConfig[priority] || { variant: 'default', label: priority }

    return (
        <Badge variant={config.variant}>
            {config.label}
        </Badge>
    )
}
