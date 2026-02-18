
import * as React from "react"
import { cn } from "@/utils/cn"

// Simplified Select Implementation
/**
 * Since we don't have Radix UI Select installed, we will build a native select wrapper
 * that mimics the shadcn/ui API structure as much as possible for compatibility.
 */

const Select = ({ children, onValueChange, defaultValue }: any) => {
    const [value, setValue] = React.useState(defaultValue || "");

    // We need to pass down props to children.
    // This is tricky with native select.
    // For now, let's create a context or just use a simpler approach:
    // We will render a native <select> but hide it and show custom UI? NO, too complex.
    // Let's implement a Context-based custom dropdown.

    const [open, setOpen] = React.useState(false);

    return (
        <SelectContext.Provider value={{ value, setValue: (v: string) => { setValue(v); onValueChange?.(v); setOpen(false); }, open, setOpen }}>
            <div className="relative inline-block w-full">{children}</div>
        </SelectContext.Provider>
    );
}

const SelectContext = React.createContext<any>(null);

const SelectTrigger = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
    ({ className, children, ...props }, ref) => {
        const { open, setOpen } = React.useContext(SelectContext);
        return (
            <button
                ref={ref}
                type="button"
                role="combobox"
                aria-expanded={open}
                onClick={() => setOpen(!open)}
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                {...props}
            >
                {children}
            </button>
        )
    }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(
    ({ className, placeholder, ...props }, ref) => {
        const { value } = React.useContext(SelectContext);
        return (
            <span
                ref={ref}
                className={cn("block truncate", className)}
                {...props}
            >
                {value || placeholder}
            </span>
        )
    }
)
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => {
        const { open } = React.useContext(SelectContext);
        if (!open) return null;
        return (
            <div
                ref={ref}
                className={cn(
                    "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 w-full mt-1",
                    className
                )}
                {...props}
            >
                <div className="p-1">{children}</div>
            </div>
        )
    }
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { value: string }>(
    ({ className, children, value, ...props }, ref) => {
        const { setValue, value: currentValue } = React.useContext(SelectContext);
        return (
            <div
                ref={ref}
                className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 hover:bg-slate-100 cursor-pointer",
                    currentValue === value && "bg-slate-50 font-medium",
                    className
                )}
                role="option"
                aria-selected={currentValue === value}
                onClick={(e) => {
                    e.stopPropagation();
                    setValue(value);
                }}
                {...props}
            >
                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {currentValue === value && <span className="text-xs">✓</span>}
                </span>
                <span className="truncate">{children}</span>
            </div>
        )
    }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator }

// Placeholders for unused exports to prevent errors
const SelectGroup = ({ children }: any) => <>{children}</>;
const SelectLabel = ({ children }: any) => <div className="px-2 py-1.5 text-sm font-semibold">{children}</div>;
const SelectSeparator = () => <div className="-mx-1 my-1 h-px bg-muted" />;

