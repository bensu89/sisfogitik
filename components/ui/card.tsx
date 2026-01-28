import { HTMLAttributes, ReactNode, forwardRef } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
    variant?: 'default' | 'glass' | 'bordered'
    padding?: 'none' | 'sm' | 'md' | 'lg'
    hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className = '', variant = 'default', padding = 'md', hover = false, children, ...props }, ref) => {
        const variants = {
            default: 'bg-white dark:bg-gray-900 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50',
            glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-white/20 dark:border-gray-700/50',
            bordered: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
        }

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        }

        return (
            <div
                ref={ref}
                className={`
          rounded-2xl
          ${variants[variant]}
          ${paddings[padding]}
          ${hover ? 'transition-all duration-300 hover:shadow-xl hover:-translate-y-1' : ''}
          ${className}
        `}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

// Card Header
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
    return (
        <div className={`pb-4 border-b border-gray-100 dark:border-gray-800 ${className}`} {...props}>
            {children}
        </div>
    )
}

// Card Title
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
    children: ReactNode
}

function CardTitle({ className = '', children, ...props }: CardTitleProps) {
    return (
        <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`} {...props}>
            {children}
        </h3>
    )
}

// Card Content
interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode
}

function CardContent({ className = '', children, ...props }: CardContentProps) {
    return (
        <div className={`pt-4 ${className}`} {...props}>
            {children}
        </div>
    )
}

export { Card, CardHeader, CardTitle, CardContent }
export type { CardProps }
