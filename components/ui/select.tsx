import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectOption {
    value: string
    label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    options: SelectOption[]
    placeholder?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', label, error, options, placeholder, id, ...props }, ref) => {
        const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={selectId}
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                    >
                        {label}
                    </label>
                )}
                <select
                    ref={ref}
                    id={selectId}
                    className={`
            w-full px-4 py-2.5 rounded-lg border transition-all duration-200
            bg-white dark:bg-gray-900
            text-gray-900 dark:text-gray-100
            focus:outline-none focus:ring-2 focus:ring-offset-0
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')]
            bg-[length:1.5rem_1.5rem]
            bg-[right_0.5rem_center]
            bg-no-repeat
            pr-10
            ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            : 'border-gray-300 dark:border-gray-700 focus:border-indigo-500 focus:ring-indigo-500/20'
                        }
            disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50 dark:disabled:bg-gray-800
            ${className}
          `}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps, SelectOption }
