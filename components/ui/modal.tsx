'use client'

import { Fragment, ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './button'

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: ReactNode
    size?: 'sm' | 'md' | 'lg' | 'xl'
    showCloseButton?: boolean
}

export function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'md',
    showCloseButton = true
}: ModalProps) {
    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    }

    return (
        <Fragment>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className={`
            w-full ${sizes[size]} 
            bg-white dark:bg-gray-900 
            rounded-2xl shadow-2xl 
            animate-in zoom-in-95 fade-in duration-200
            max-h-[90vh] overflow-hidden
          `}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    {(title || showCloseButton) && (
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                            {title && (
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                                    {title}
                                </h2>
                            )}
                            {showCloseButton && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={onClose}
                                    className="ml-auto -mr-2"
                                >
                                    <X className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                        {children}
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
