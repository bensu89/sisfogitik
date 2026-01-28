import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    helperText?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', label, error, helperText, id, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    className={`
            w-full px-4 py-2.5 rounded-lg border transition-all duration-200
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:outline-none focus:ring-2 focus:ring-offset-0
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
            ${className}
          `}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'

export { Input }
export type { InputProps }
