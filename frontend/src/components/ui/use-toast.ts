
// Simplified Toast Hook
import { useState, useEffect } from "react"

export interface Toast {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
}

// Global state for toasts (simplified for demo)
let listeners: Array<(toasts: Toast[]) => void> = []
let memoryToasts: Toast[] = []

function dispatch(toast: Toast) {
    memoryToasts = [...memoryToasts, toast]
    listeners.forEach((listener) => listener(memoryToasts))

    // Auto dismiss
    setTimeout(() => {
        memoryToasts = memoryToasts.filter((t) => t.id !== toast.id)
        listeners.forEach((listener) => listener(memoryToasts))
    }, 3000)
}

export function useToast() {
    const [toasts, setToasts] = useState<Toast[]>(memoryToasts)

    useEffect(() => {
        listeners.push(setToasts)
        return () => {
            listeners = listeners.filter((l) => l !== setToasts)
        }
    }, [])

    return {
        toast: ({ title, description, variant }: Omit<Toast, "id">) => {
            const id = Math.random().toString(36).substring(2, 9)
            dispatch({ id, title, description, variant })
        },
        toasts,
        dismiss: (id: string) => {
            memoryToasts = memoryToasts.filter((t) => t.id !== id)
            listeners.forEach((listener) => listener(memoryToasts))
        }
    }
}
