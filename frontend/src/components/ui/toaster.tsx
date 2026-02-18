
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
    const { toasts } = useToast()

    return (
        <div className="fixed top-0 right-0 z-[100] flex flex-col gap-2 p-4 w-full max-w-[420px]">
            {toasts.map(function ({ id, title, description, variant }) {
                return (
                    <div key={id} className={`max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 ${variant === 'destructive' ? 'bg-red-50 ring-red-500' : ''}`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="ml-3 flex-1">
                                    {title && <p className={`text-sm font-medium ${variant === 'destructive' ? 'text-red-800' : 'text-gray-900'}`}>{title}</p>}
                                    {description && <p className={`mt-1 text-sm ${variant === 'destructive' ? 'text-red-700' : 'text-gray-500'}`}>{description}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
